package grampulse

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

const openMeteoBaseURL = "https://api.open-meteo.com/v1"
const openMeteoArchiveURL = "https://archive-api.open-meteo.com/v1"

// District → (lat, lon) mapping for Maharashtra districts
var districtCoords = map[string][2]float64{
	"Nashik":       {20.0059, 73.7898},
	"Surgana":      {20.5519, 73.6111},
	"Pune":         {18.5204, 73.8567},
	"Aurangabad":   {19.8762, 75.3433},
	"Nagpur":       {21.1458, 79.0882},
	"Solapur":      {17.6805, 75.9064},
	"Kolhapur":     {16.7050, 74.2433},
	"Amravati":     {20.9374, 77.7796},
	"Latur":        {18.4088, 76.5604},
	"Nanded":       {19.1383, 77.3210},
}

// WeatherClient fetches live weather data from Open-Meteo and caches in SQLite.
type WeatherClient struct {
	repo        *Repository
	cacheTTLHrs int
}

func NewWeatherClient(repo *Repository) *WeatherClient {
	return &WeatherClient{repo: repo, cacheTTLHrs: 6}
}

// GetLocationForecast fetches the 16-day forecast and computes climate risk.
func (w *WeatherClient) GetLocationForecast(ctx context.Context, locationKey string, forecastDays int) (WeatherForecastResponse, error) {
	cacheKey := fmt.Sprintf("weather:forecast:%s:%dd", locationKey, forecastDays)
	loc, ok := LocationRegistry[locationKey]
	if !ok {
		return WeatherForecastResponse{}, fmt.Errorf("unknown location key: %s", locationKey)
	}

	// 1. Fresh cache
	cached, err := w.repo.GetLocationWeatherCache(ctx, cacheKey)
	if err == nil && cached != nil && time.Now().Before(cached.ExpiresAt) {
		var resp WeatherForecastResponse
		if err := json.Unmarshal([]byte(cached.PayloadJSON), &resp); err == nil {
			resp.ClimateRisk.SourceStatus = "cached"
			return resp, nil
		}
	}

	// 2. Live Request
	liveResp, err := w.fetchLiveForecast(ctx, loc, forecastDays)
	if err == nil {
		liveResp.ClimateRisk.SourceStatus = "live"
		payloadBytes, _ := json.Marshal(liveResp)
		_ = w.repo.UpsertLocationWeatherCache(ctx, WeatherCacheRowV2{
			CacheKey:    cacheKey,
			LocationKey: locationKey,
			RequestType: "forecast",
			PayloadJSON: string(payloadBytes),
			Source:      "open-meteo",
			FetchedAt:   time.Now().UTC(),
			ExpiresAt:   time.Now().UTC().Add(time.Duration(w.cacheTTLHrs) * time.Hour),
		})
		return liveResp, nil
	}

	// 3. Stale cache fallback
	if cached != nil {
		var resp WeatherForecastResponse
		if err := json.Unmarshal([]byte(cached.PayloadJSON), &resp); err == nil {
			resp.ClimateRisk.SourceStatus = "fallback"
			resp.ClimateRisk.IsStale = true
			return resp, nil
		}
	}

	return WeatherForecastResponse{}, fmt.Errorf("weather fetch failed and no cache available: %v", err)
}

func (w *WeatherClient) RefreshLocationForecast(ctx context.Context, locationKey string, forecastDays int) error {
	loc, ok := LocationRegistry[locationKey]
	if !ok {
		return fmt.Errorf("unknown location key: %s", locationKey)
	}
	
	liveResp, err := w.fetchLiveForecast(ctx, loc, forecastDays)
	if err != nil {
		return err
	}
	
	cacheKey := fmt.Sprintf("weather:forecast:%s:%dd", locationKey, forecastDays)
	payloadBytes, _ := json.Marshal(liveResp)
	return w.repo.UpsertLocationWeatherCache(ctx, WeatherCacheRowV2{
		CacheKey:    cacheKey,
		LocationKey: locationKey,
		RequestType: "forecast",
		PayloadJSON: string(payloadBytes),
		Source:      "open-meteo",
		FetchedAt:   time.Now().UTC(),
		ExpiresAt:   time.Now().UTC().Add(time.Duration(w.cacheTTLHrs) * time.Hour),
	})
}

func (w *WeatherClient) fetchLiveForecast(ctx context.Context, loc Location, forecastDays int) (WeatherForecastResponse, error) {
	params := url.Values{}
	params.Set("latitude", fmt.Sprintf("%.4f", loc.Latitude))
	params.Set("longitude", fmt.Sprintf("%.4f", loc.Longitude))
	params.Set("timezone", loc.Timezone)
	params.Set("forecast_days", strconv.Itoa(forecastDays))
	params.Set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,weather_code")

	apiURL := openMeteoBaseURL + "/forecast?" + params.Encode()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, apiURL, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return WeatherForecastResponse{}, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var payload struct {
		Daily struct {
			Time                   []string   `json:"time"`
			Temperature2mMax       []*float64 `json:"temperature_2m_max"`
			Temperature2mMin       []*float64 `json:"temperature_2m_min"`
			RainSum                []*float64 `json:"rain_sum"`
			PrecipProbabilityMax   []*float64 `json:"precipitation_probability_max"`
			WindSpeed10mMax        []*float64 `json:"wind_speed_10m_max"`
			WeatherCode            []*int     `json:"weather_code"`
		} `json:"daily"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return WeatherForecastResponse{}, err
	}

	// Normalise to DailyWeatherPoint
	var dailyPoints []DailyWeatherPoint
	for i, date := range payload.Daily.Time {
		dailyPoints = append(dailyPoints, DailyWeatherPoint{
			Date:                       date,
			TemperatureMaxC:            safeIndexF(payload.Daily.Temperature2mMax, i),
			TemperatureMinC:            safeIndexF(payload.Daily.Temperature2mMin, i),
			RainfallMm:                 safeIndexF(payload.Daily.RainSum, i),
			PrecipitationProbabilityPct: safeIndexF(payload.Daily.PrecipProbabilityMax, i),
			WindSpeedMaxKmh:            safeIndexF(payload.Daily.WindSpeed10mMax, i),
			WeatherCode:                safeIndexI(payload.Daily.WeatherCode, i),
		})
	}

	climateRisk := calculateClimateRisk(loc.District, dailyPoints)

	return WeatherForecastResponse{
		LocationKey: loc.Key,
		Latitude:    loc.Latitude,
		Longitude:   loc.Longitude,
		Timezone:    loc.Timezone,
		Daily:       dailyPoints,
		ClimateRisk: climateRisk,
	}, nil
}

func calculateClimateRisk(district string, daily []DailyWeatherPoint) ClimateRiskSummary {
	var totalRain float64
	var maxTemps []float64
	var extremeHeatDays, heavyRainDays int

	rainVals := make([]bool, len(daily))
	
	for i, pt := range daily {
		r := 0.0
		if pt.RainfallMm != nil {
			r = *pt.RainfallMm
		}
		totalRain += r
		if r >= 50 {
			heavyRainDays++
		}
		rainVals[i] = r < 1.0

		if pt.TemperatureMaxC != nil {
			maxTemps = append(maxTemps, *pt.TemperatureMaxC)
			if *pt.TemperatureMaxC >= 38 {
				extremeHeatDays++
			}
		}
	}

	var tempMean float64
	if len(maxTemps) > 0 {
		var sum float64
		for _, t := range maxTemps {
			sum += t
		}
		tempMean = sum / float64(len(maxTemps))
	}

	consecutiveDryDays := longestSequence(rainVals)

	// Anomaly relative to a simplistic normal
	normalRain := float64(len(daily)) * 4.0
	var rainfallAnomaly *float64
	if normalRain > 0 {
		anomaly := ((totalRain - normalRain) / normalRain) * 100
		rainfallAnomaly = &anomaly
	}

	droughtPoints := 0
	if consecutiveDryDays >= 7 {
		droughtPoints += 25
	}
	if rainfallAnomaly != nil && *rainfallAnomaly <= -20 {
		droughtPoints += 25
	}

	heatPoints := int(math.Min(float64(extremeHeatDays*5), 25))
	floodPoints := int(math.Min(float64(heavyRainDays*10), 25))

	score := math.Min(float64(droughtPoints+heatPoints+floodPoints), 100)

	return ClimateRiskSummary{
		District:           district,
		RainfallForecastMm: totalRain,
		RainfallAnomalyPct: rainfallAnomaly,
		TemperatureMeanC:   tempMean,
		ExtremeHeatDays:    extremeHeatDays,
		HeavyRainDays:      heavyRainDays,
		ConsecutiveDryDays: consecutiveDryDays,
		DroughtRisk:        riskBand(droughtPoints),
		FloodRisk:          riskBand(floodPoints),
		ClimateRiskScore:   score,
		Source:             "open-meteo",
		SourceStatus:       "live",
		FetchedAt:          time.Now().UTC(),
		IsStale:            false,
	}
}

func longestSequence(vals []bool) int {
	longest, current := 0, 0
	for _, v := range vals {
		if v {
			current++
			if current > longest {
				longest = current
			}
		} else {
			current = 0
		}
	}
	return longest
}

func riskBand(score int) string {
	if score >= 50 {
		return "High"
	}
	if score >= 25 {
		return "Moderate"
	}
	return "Low"
}

func safeIndexF(slice []*float64, idx int) *float64 {
	if idx >= 0 && idx < len(slice) {
		return slice[idx]
	}
	return nil
}

func safeIndexI(slice []*int, idx int) *int {
	if idx >= 0 && idx < len(slice) {
		return slice[idx]
	}
	return nil
}

// ── Market Client ─────────────────────────────────────────────────────────────

// MarketClient fetches commodity prices from data.gov.in AGMARKNET API,
// with CSV fallback and SQLite cache.
type MarketClient struct {
	repo       *Repository
	apiKey     string
	csvData    map[string][]csvPriceRow // commodity → monthly prices
	cacheTTLHrs int
}

type csvPriceRow struct {
	Month      string
	ModalPrice float64
	District   string
}

func NewMarketClient(repo *Repository, csvPath, apiKey string) *MarketClient {
	mc := &MarketClient{
		repo:        repo,
		apiKey:      apiKey,
		csvData:     make(map[string][]csvPriceRow),
		cacheTTLHrs: 24,
	}
	_ = mc.loadCSV(csvPath)
	return mc
}

func (mc *MarketClient) loadCSV(path string) error {
	if path == "" {
		return nil
	}
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	r := &csvReaderSimple{}
	rows, err := r.ReadAll(f)
	if err != nil {
		return err
	}
	if len(rows) < 2 {
		return nil
	}

	header := rows[0]
	colIdx := make(map[string]int)
	for i, h := range header {
		colIdx[h] = i
	}

	for _, row := range rows[1:] {
		commodity := strings.TrimSpace(safeCSVCol(row, colIdx, "commodity"))
		if commodity == "" {
			continue
		}
		price, _ := strconv.ParseFloat(strings.TrimSpace(safeCSVCol(row, colIdx, "modal_price")), 64)
		mc.csvData[commodity] = append(mc.csvData[commodity], csvPriceRow{
			Month:      safeCSVCol(row, colIdx, "month"),
			ModalPrice: price,
			District:   safeCSVCol(row, colIdx, "district"),
		})
	}
	return nil
}

// GetPrices returns current + historical prices for a commodity.
// Priority: Live API → SQLite cache → CSV → synthetic.
func (mc *MarketClient) GetPrices(ctx context.Context, commodity, district string, months int) MarketPrice {
	now := time.Now().UTC()
	currentMonth := now.Format("2006-01")

	// 1. Try AGMARKNET daily prices (Track A & B)
	agmarknetPrices, err := mc.repo.GetLatestAgmarknetPrices(ctx, commodity, district, 90) // fetch up to 90 days
	if err == nil && len(agmarknetPrices) > 0 {
		latest := agmarknetPrices[0]
		fetchedAt, _ := time.Parse(time.RFC3339, latest.FetchedAt)
		isStale := time.Since(fetchedAt) > time.Duration(mc.cacheTTLHrs)*time.Hour
		
		change1m := 0.0
		change3m := 0.0
		volatility3m := 0.0

		// Simple approximation for changes
		if len(agmarknetPrices) > 30 && agmarknetPrices[30].ModalPrice > 0 {
			change1m = (latest.ModalPrice / agmarknetPrices[30].ModalPrice) - 1
		}
		lastIdx := len(agmarknetPrices) - 1
		if lastIdx > 80 && agmarknetPrices[lastIdx].ModalPrice > 0 {
			change3m = (latest.ModalPrice / agmarknetPrices[lastIdx].ModalPrice) - 1
		}

		// Calculate 3m volatility (standard deviation of daily prices over 90 days)
		if len(agmarknetPrices) > 1 {
			var sum, mean, sumSq float64
			for _, p := range agmarknetPrices {
				sum += p.ModalPrice
			}
			mean = sum / float64(len(agmarknetPrices))
			for _, p := range agmarknetPrices {
				diff := p.ModalPrice - mean
				sumSq += diff * diff
			}
			variance := sumSq / float64(len(agmarknetPrices)-1)
			if mean > 0 {
				volatility3m = math.Sqrt(variance) / mean // Coefficient of Variation
			}
		}

		mp := mc.buildResponse(commodity, latest.DistrictName, latest.ModalPrice, currentMonth, SourceCachedAPI, latest.Source, isStale, fetchedAt)
		mp.PriceChange1m = change1m
		mp.PriceChange3m = change3m
		mp.PriceVolatility3m = volatility3m
		return mp
	}

	// 2. Legacy Live API
	if mc.apiKey != "" && commodity != "MilkCow" {
		if price, err := mc.fetchLiveAPI(ctx, commodity); err == nil {
			_ = mc.repo.UpsertMarketCache(ctx, commodity, currentMonth, price, "live-api")
			return mc.buildResponse(commodity, district, price, currentMonth, SourceLiveAPI, "live-api", false, now)
		}
	}

	// 3. SQLite cache (Legacy)
	if cached, err := mc.repo.GetMarketCache(ctx, commodity, currentMonth); err == nil && cached != nil {
		fetchedAt, _ := time.Parse(time.RFC3339, cached.FetchedAt)
		isStale := time.Since(fetchedAt) > time.Duration(mc.cacheTTLHrs)*time.Hour
		return mc.buildResponse(commodity, district, cached.ModalPrice, currentMonth, SourceCachedAPI, "cached-api", isStale, fetchedAt)
	}

	// 3. CSV fallback
	if rows, ok := mc.csvData[commodity]; ok && len(rows) > 0 {
		latest := rows[len(rows)-1]
		return mc.buildResponse(commodity, district, latest.ModalPrice, latest.Month, SourceOfficialCSV, "official-csv", false, now)
	}

	// 4. Synthetic (labelled)
	syntheticPrice := map[string]float64{
		"Maize": 2150, "Soybean": 4600, "Onion": 1800, "Tomato": 1200,
		"Wheat": 2300, "Fodder": 800, "Poultry": 12000,
		"MilkCow": 0, // milk price is synthetic enterprise input, not a market price
	}
	price := syntheticPrice[commodity]
	sourceType := "synthetic"
	if commodity == "MilkCow" {
		sourceType = "synthetic-enterprise-input"
	}
	return mc.buildResponse(commodity, district, price, currentMonth, SourceSynthetic, sourceType, true, now)
}

func (mc *MarketClient) fetchLiveAPI(ctx context.Context, commodity string) (float64, error) {
	params := url.Values{}
	params.Set("api-key", mc.apiKey)
	params.Set("format", "json")
	params.Set("limit", "10")
	params.Set("filters[state]", "Maharashtra")
	params.Set("filters[commodity]", commodity)

	apiURL := "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?" + params.Encode()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, apiURL, nil)
	req.Header.Set("User-Agent", "GramPulse/2.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var data struct {
		Records []map[string]any `json:"records"`
	}
	if err := json.Unmarshal(body, &data); err != nil || len(data.Records) == 0 {
		return 0, fmt.Errorf("no live data")
	}

	for _, rec := range data.Records {
		if p, ok := rec["modal_price"]; ok {
			switch v := p.(type) {
			case float64:
				return v, nil
			case string:
				if f, err := strconv.ParseFloat(v, 64); err == nil {
					return f, nil
				}
			}
		}
	}
	return 0, fmt.Errorf("no price in records")
}

func (mc *MarketClient) buildResponse(commodity, district string, price float64, month string,
	source DataSource, sourceType string, isStale bool, fetchedAt time.Time) MarketPrice {
	mp := MarketPrice{
		Commodity:     commodity,
		ModalPrice:    price,
		LatestMonth:   month,
		Source:        source,
		SourceType:    sourceType,
		FetchedAt:     fetchedAt,
		IsStale:       isStale,
	}
	if district != "" {
		mp.District = &district
	}
	mp.Unit = unitFor(commodity)
	return mp
}

func unitFor(commodity string) string {
	switch commodity {
	case "MilkCow":
		return "Litre"
	case "Poultry":
		return "Kg"
	default:
		return "Quintal"
	}
}

// ── minimal CSV reader ────────────────────────────────────────────────────────

type csvReaderSimple struct{}

func (c *csvReaderSimple) ReadAll(r io.Reader) ([][]string, error) {
	body, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}
	lines := strings.Split(string(body), "\n")
	var out [][]string
	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		out = append(out, strings.Split(line, ","))
	}
	return out, nil
}

func safeCSVCol(row []string, idx map[string]int, col string) string {
	i, ok := idx[col]
	if !ok || i >= len(row) {
		return ""
	}
	return strings.TrimSpace(row[i])
}
