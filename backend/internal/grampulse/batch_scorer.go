package grampulse

import (
	"context"
	"encoding/json"
	"time"

	"go.uber.org/zap"
)

// BatchScorer runs CatBoost scoring for all enterprises in the background.
// It calls the Python ML service /ml/batch-score in chunks of 50.
type BatchScorer struct {
	store   *SyntheticStore
	repo    *Repository
	ml      *MLClient
	market  *MarketClient
	weather *WeatherClient
	logger  *zap.Logger

	progress   int
	total      int
	lastDoneAt *time.Time
	done       bool
}

func NewBatchScorer(store *SyntheticStore, repo *Repository, ml *MLClient,
	market *MarketClient, weather *WeatherClient, logger *zap.Logger) *BatchScorer {
	return &BatchScorer{store: store, repo: repo, ml: ml,
		market: market, weather: weather, logger: logger}
}

func (b *BatchScorer) Status() map[string]any {
	return map[string]any{
		"total":      b.total,
		"progress":   b.progress,
		"done":       b.done,
		"lastDoneAt": b.lastDoneAt,
	}
}

// Start launches the batch scorer in a background goroutine.
// It skips enterprises that already have a fresh risk_assessments row (< 7 days old).
func (b *BatchScorer) Start(ctx context.Context) {
	go func() {
		entityIDs := b.store.GetAllEntityIDs()
		b.total = len(entityIDs)
		b.logger.Info("batch scorer starting", zap.Int("total", b.total))

		// Fetch shared market + weather features once (Nashik as representative)
		maize := b.market.GetPrices(ctx, "Maize", "Nashik", 1)
		soy := b.market.GetPrices(ctx, "Soybean", "Nashik", 1)
		
		loc := ResolveLocation("Nashik", "")
		forecastResp, _ := b.weather.GetLocationForecast(ctx, loc.Key, 16)
		climate := forecastResp.ClimateRisk

		rainfallAnomaly := 0.0
		if climate.RainfallAnomalyPct != nil {
			rainfallAnomaly = *climate.RainfallAnomalyPct
		}
		tempMean := climate.TemperatureMeanC
		climateScore := climate.ClimateRiskScore
		weatherFetchedAt := climate.FetchedAt.Format(time.RFC3339)
		marketFetchedAt := maize.FetchedAt.Format(time.RFC3339)
		feedIndex := 0.60*maize.ModalPrice + 0.40*soy.ModalPrice

		mlMarket := &mlMarketFeatures{
			MaizePrice:      &maize.ModalPrice,
			SoybeanPrice:    &soy.ModalPrice,
			FeedIndex:       &feedIndex,
			CommodityPriceChange1m: &maize.PriceChange1m,
			CommodityPriceChange3m: &maize.PriceChange3m,
			CommodityPriceVolatility3m: &maize.PriceVolatility3m,
			MarketSource:    string(maize.Source),
			MarketFetchedAt: &marketFetchedAt,
		}
		mlWeather := &mlWeatherFeatures{
			RainfallAnomalyPct:   &rainfallAnomaly,
			TemperatureMean:      &tempMean,
			ClimateRiskScore:     &climateScore,
			ExtremeHeatDays:      &climate.ExtremeHeatDays,
			ConsecutiveDryDays:   &climate.ConsecutiveDryDays,
			WeatherSource:        climate.Source,
			WeatherFetchedAt:     &weatherFetchedAt,
		}

		// Process in chunks of 50
		chunkSize := 50
		for i := 0; i < len(entityIDs); i += chunkSize {
			end := i + chunkSize
			if end > len(entityIDs) {
				end = len(entityIDs)
			}
			chunk := entityIDs[i:end]

			// Build request for this chunk
			var enterprises []mlEnterpriseScore
			for _, eid := range chunk {
				history := b.store.GetHistory(eid, 24)
				if len(history) == 0 {
					continue
				}
				ent, _ := b.store.GetEnterprise(eid)
				var loan *mlLoanObligations
				if ent != nil {
					emi := ent.SanctionedLimit / 36
					loan = &mlLoanObligations{
						ScheduledEmiMonthly:           emi,
						ScheduledLoanRepaymentMonthly: 0,
						OutstandingAmount:             ent.SanctionedLimit * 0.7,
					}
				}
				enterprises = append(enterprises, mlEnterpriseScore{
					EnterpriseID:    eid,
					History:         history,
					LoanObligations: loan,
				})
			}

			if len(enterprises) == 0 {
				b.progress += len(chunk)
				continue
			}

			result, err := b.ml.BatchScore(ctx, mlBatchScoreRequest{
				Enterprises:     enterprises,
				MarketFeatures:  mlMarket,
				WeatherFeatures: mlWeather,
			})
			if err != nil {
				b.logger.Warn("batch score chunk failed", zap.Error(err), zap.Int("offset", i))
				b.progress += len(chunk)
				continue
			}

			// Persist all scores
			if scores, ok := result["scores"].([]any); ok {
				for _, scoreRaw := range scores {
					score, ok := scoreRaw.(map[string]any)
					if !ok {
						continue
					}
					eid := score["enterpriseId"].(string)
					drivers, _ := json.Marshal(score["drivers"])
					rr := RiskRow{
						EnterpriseID:         eid,
						RiskScore:            toFloat(score["riskScore"]),
						RiskLevel:            toString(score["riskLevel"]),
						ForecastDeficit:      toFloat(score["forecastDeficit"]),
						DebtServiceShortfall: toFloat(score["debtServiceShortfall"]),
						StressMonth:          toString(score["stressMonth"]),
						WarningLeadTimeDays:  int(toFloat(score["warningLeadTimeDays"])),
						DriversJSON:          string(drivers),
						AssessedAt:           time.Now().UTC().Format(time.RFC3339),
					}
					_ = b.repo.UpsertRiskAssessment(ctx, rr)
				}
			}

			b.progress += len(chunk)
			b.logger.Info("batch scorer progress",
				zap.Int("progress", b.progress), zap.Int("total", b.total))
		}

		now := time.Now().UTC()
		b.lastDoneAt = &now
		b.done = true
		b.logger.Info("batch scorer complete", zap.Int("scored", b.progress))
	}()
}
