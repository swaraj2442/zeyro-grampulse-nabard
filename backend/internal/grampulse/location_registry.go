package grampulse

import (
	"strings"
)

// Location represents a geospatial coordinate profile for weather queries.
type Location struct {
	Key       string
	Name      string
	District  string
	State     string
	Latitude  float64
	Longitude float64
	Timezone  string
}

// LocationRegistry is a hardcoded fallback mapping.
// It avoids calling the geocoding API repeatedly.
var LocationRegistry = map[string]Location{
	"nashik-surgana": {
		Key:       "nashik-surgana",
		Name:      "Surgana",
		District:  "Nashik",
		State:     "Maharashtra",
		Latitude:  20.57,
		Longitude: 73.62,
		Timezone:  "Asia/Kolkata",
	},
	"nashik-dindori": {
		Key:       "nashik-dindori",
		Name:      "Dindori",
		District:  "Nashik",
		State:     "Maharashtra",
		Latitude:  20.20,
		Longitude: 73.83,
		Timezone:  "Asia/Kolkata",
	},
	"pune": {
		Key:       "pune",
		Name:      "Pune",
		District:  "Pune",
		State:     "Maharashtra",
		Latitude:  18.52,
		Longitude: 73.85,
		Timezone:  "Asia/Kolkata",
	},
	"aurangabad": {
		Key:       "aurangabad",
		Name:      "Aurangabad",
		District:  "Aurangabad",
		State:     "Maharashtra",
		Latitude:  19.88,
		Longitude: 75.34,
		Timezone:  "Asia/Kolkata",
	},
	"nagpur": {
		Key:       "nagpur",
		Name:      "Nagpur",
		District:  "Nagpur",
		State:     "Maharashtra",
		Latitude:  21.15,
		Longitude: 79.09,
		Timezone:  "Asia/Kolkata",
	},
	"solapur": {
		Key:       "solapur",
		Name:      "Solapur",
		District:  "Solapur",
		State:     "Maharashtra",
		Latitude:  17.68,
		Longitude: 75.90,
		Timezone:  "Asia/Kolkata",
	},
	"kolhapur": {
		Key:       "kolhapur",
		Name:      "Kolhapur",
		District:  "Kolhapur",
		State:     "Maharashtra",
		Latitude:  16.70,
		Longitude: 74.24,
		Timezone:  "Asia/Kolkata",
	},
	"amravati": {
		Key:       "amravati",
		Name:      "Amravati",
		District:  "Amravati",
		State:     "Maharashtra",
		Latitude:  20.94,
		Longitude: 77.78,
		Timezone:  "Asia/Kolkata",
	},
	"latur": {
		Key:       "latur",
		Name:      "Latur",
		District:  "Latur",
		State:     "Maharashtra",
		Latitude:  18.41,
		Longitude: 76.56,
		Timezone:  "Asia/Kolkata",
	},
	"nanded": {
		Key:       "nanded",
		Name:      "Nanded",
		District:  "Nanded",
		State:     "Maharashtra",
		Latitude:  19.14,
		Longitude: 77.32,
		Timezone:  "Asia/Kolkata",
	},
	// Default fallback
	"maharashtra-center": {
		Key:       "maharashtra-center",
		Name:      "Maharashtra",
		District:  "Unknown",
		State:     "Maharashtra",
		Latitude:  19.0,
		Longitude: 74.0,
		Timezone:  "Asia/Kolkata",
	},
}

// ResolveLocation maps a district or block string to a known Location.
func ResolveLocation(district, block string) Location {
	d := strings.ToLower(strings.TrimSpace(district))
	b := strings.ToLower(strings.TrimSpace(block))

	// Try strict combination first
	if loc, ok := LocationRegistry[d+"-"+b]; ok {
		return loc
	}

	// Try district alone
	if loc, ok := LocationRegistry[d]; ok {
		return loc
	}

	// If Nashik but block unknown, default to dindori as a representative area
	if d == "nashik" {
		return LocationRegistry["nashik-dindori"]
	}

	return LocationRegistry["maharashtra-center"]
}
