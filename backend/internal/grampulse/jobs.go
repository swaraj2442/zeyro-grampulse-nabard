package grampulse

import (
	"context"
	"log"
	"time"
)

func StartWeatherRefreshJob(ctx context.Context, wc *WeatherClient) {
	ticker := time.NewTicker(6 * time.Hour)
	go func() {
		for {
			select {
			case <-ctx.Done():
				ticker.Stop()
				return
			case <-ticker.C:
				log.Println("Starting scheduled weather refresh...")
				for key := range LocationRegistry {
					err := wc.RefreshLocationForecast(ctx, key, 16)
					if err != nil {
						log.Printf("Failed to refresh weather for %s: %v", key, err)
					} else {
						log.Printf("Successfully refreshed weather for %s", key)
					}
					// Slight delay to avoid hitting Open-Meteo too fast
					time.Sleep(1 * time.Second)
				}
				log.Println("Completed scheduled weather refresh.")
			}
		}
	}()
}

func StartAgmarknetRefreshJob(ctx context.Context, ac *AgmarknetClient, apiKey string) {
	ticker := time.NewTicker(24 * time.Hour) // Daily fetch
	go func() {
		for {
			select {
			case <-ctx.Done():
				ticker.Stop()
				return
			case <-ticker.C:
				log.Println("Starting scheduled AGMARKNET datagov refresh...")
				err := ac.FetchDataGovIn(ctx, apiKey)
				if err != nil {
					log.Printf("Failed to refresh AGMARKNET prices: %v", err)
				} else {
					log.Printf("Successfully refreshed AGMARKNET prices")
				}
			}
		}
	}()
}
