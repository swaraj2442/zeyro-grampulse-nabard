package grampulse

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
)

func (s *Service) GetPortfolioForecastTimeseries(ctx context.Context, district, sector string) (*PortfolioForecastTimeseriesResponse, error) {
	// Read the pre-calculated offline snapshot
	b, err := ioutil.ReadFile("data/portfolio_forecast_snapshot.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read offline snapshot: %v", err)
	}

	var resp PortfolioForecastTimeseriesResponse
	if err := json.Unmarshal(b, &resp); err != nil {
		return nil, fmt.Errorf("failed to parse snapshot: %v", err)
	}

	return &resp, nil
}
