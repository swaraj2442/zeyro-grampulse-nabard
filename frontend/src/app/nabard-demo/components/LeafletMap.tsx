"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as topojson from 'topojson-client';
import L from 'leaflet';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletMapProps {
  selected: any;
  setSelected: (s: any) => void;
  setTooltip: (t: any) => void;
  scoreToFill: (score: number | undefined) => string;
  scoreToHover: (score: number | undefined) => string;
  STATES: any[];
  STATE_BY_GEONAME: Record<string, any>;
  STATE_DISTRICTS: Record<string, any[]>;
  mapMode?: 'map' | 'satellite' | 'terrain';
}

function MapController({ selected, stateGeoJson }: { selected: any, stateGeoJson: any }) {
  const map = useMap();

  useEffect(() => {
    if (!stateGeoJson) return;
    
    if (selected.id === 'IN') {
      map.flyTo([22.5, 82.5], 4.5, { duration: 1.5, easeLinearity: 0.2 });
    } else {
      const feature = stateGeoJson.features.find((f: any) => 
        f.properties.st_nm === selected.geoName || f.properties.name === selected.geoName
      );
      if (feature) {
        const layer = L.geoJSON(feature);
        map.flyToBounds(layer.getBounds(), { 
          paddingTopLeft: [30, 30], 
          paddingBottomRight: [30, 80], 
          maxZoom: 8, 
          duration: 1.5, 
          easeLinearity: 0.2 
        });
      }
    }
  }, [selected, stateGeoJson, map]);

  return null;
}

function DistrictBordersLayer({ districtMesh, selectedGeoName, mapMode }: { districtMesh: any, selectedGeoName: string, mapMode: string }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    setIsReady(false);
  }, [selectedGeoName]);

  useMapEvents({
    zoom: () => setZoom(map.getZoom()),
    moveend: () => setIsReady(true)
  });

  if (!isReady || !districtMesh || zoom >= 8.5 || zoom < 5.5) return null;

  return (
    <GeoJSON 
      key={`districts-${selectedGeoName}-${mapMode}`} 
      data={districtMesh} 
      style={{
        color: mapMode === 'satellite' ? '#ffffff' : (mapMode === 'terrain' ? '#1f2937' : '#ef4444'),
        weight: mapMode === 'satellite' ? 1.0 : 0.6,
        dashArray: '3, 4',
        opacity: mapMode === 'satellite' ? 0.7 : (mapMode === 'terrain' ? 0.6 : 0.4),
        fill: false
      }}
      interactive={false}
    />
  );
}

export default React.memo(function LeafletMap({
  selected, setSelected, setTooltip, scoreToFill, scoreToHover, STATES, STATE_BY_GEONAME, STATE_DISTRICTS, mapMode = 'map'
}: LeafletMapProps) {
  const [statesGeoJson, setStatesGeoJson] = useState<any>(null);
  const [topoData, setTopoData] = useState<any>(null);
  const [districtsTopo, setDistrictsTopo] = useState<any>(null);
  const [districtsGeoJson, setDistrictsGeoJson] = useState<any>(null);

  const selectedRef = React.useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    Promise.all([
      fetch('/india-states.topojson').then(r => r.json()),
      fetch('/india-districts.topojson').then(r => r.json())
    ]).then(([statesT, distsT]) => {
      setTopoData(statesT);
      setDistrictsTopo(distsT);
      const sGeo = topojson.feature(statesT, statesT.objects['india-states']);
      setStatesGeoJson(sGeo);
      const dGeo = topojson.feature(distsT, distsT.objects['india-udit']);
      setDistrictsGeoJson(dGeo);
    }).catch(err => console.error("Error loading map data:", err));
  }, []);

  const borderMesh = useMemo(() => {
    if (!topoData) return null;
    const hasSelection = selected.id !== 'IN';
    const selName = selected.geoName;
    
    return topojson.mesh(topoData, topoData.objects['india-states'], (a: any, b: any) => {
      const nameA = a.properties?.st_nm || a.properties?.name;
      const nameB = b.properties?.st_nm || b.properties?.name;
      if (hasSelection && (nameA === selName || nameB === selName)) return false;
      return true;
    });
  }, [topoData, selected]);

  const districtMesh = useMemo(() => {
    if (!districtsTopo || selected.id === 'IN') return null;
    const selName = selected.geoName;
    
    return topojson.mesh(districtsTopo, districtsTopo.objects['india-udit'], (a: any, b: any) => {
      const nameA = a.properties?.st_nm;
      const nameB = b.properties?.st_nm;
      return a !== b && nameA === selName && nameB === selName;
    });
  }, [districtsTopo, selected]);

  const selectedDistrictsGeoJson = useMemo(() => {
    if (!districtsGeoJson || selected.id === 'IN') return null;
    return {
      type: 'FeatureCollection',
      features: districtsGeoJson.features.filter((f: any) => f.properties.st_nm === selected.geoName)
    };
  }, [districtsGeoJson, selected]);

  const getStateStyle = useCallback((feature: any, currentSelected: any) => {
    const name = feature.properties.st_nm || feature.properties.name;
    const state = STATE_BY_GEONAME[name];
    const isSelected = currentSelected.geoName === name;
    const hasSelection = currentSelected.id !== 'IN';
    
    return {
      fillColor: scoreToFill(state?.score),
      weight: 0, 
      opacity: 0, 
      fillOpacity: isSelected ? 0.15 : (hasSelection ? 0.75 : 0.5), 
      className: 'transition-all duration-300 ease-in-out'
    };
  }, [scoreToFill, STATE_BY_GEONAME]);

  const geoJsonStyle = useCallback((feature: any) => {
    return getStateStyle(feature, selected);
  }, [selected, getStateStyle]);

  const onEachState = useCallback((feature: any, layer: L.Layer) => {
    const name = feature.properties.st_nm || feature.properties.name;
    const state = STATE_BY_GEONAME[name];

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        const currentSel = selectedRef.current;
        const hasSelection = currentSel.id !== 'IN';
        
        if (currentSel.geoName !== name) {
          l.setStyle({
            fillColor: scoreToHover(state?.score),
            fillOpacity: hasSelection ? 0.85 : 0.7, 
            weight: 0, 
            opacity: 0 
          });
        }
        setTooltip({
          x: e.containerPoint.x, 
          y: e.containerPoint.y,
          name,
          score: state?.score
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getStateStyle(feature, selectedRef.current));
        setTooltip(null);
      },
      click: () => {
        if (state) setSelected(state);
      }
    });
  }, [getStateStyle, scoreToHover, setTooltip, STATE_BY_GEONAME, setSelected]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <style>{`
        .leaflet-container { background: transparent !important; }
        .leaflet-interactive { transition: fill-opacity 0.2s, fill-color 0.2s; }
      `}</style>
      <MapContainer 
        center={[22.5, 82.5]} 
        zoom={4.5} 
        maxZoom={19}
        minZoom={3}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={true}
      >
        {mapMode === 'satellite' && (
          <TileLayer
            key="satellite"
            attribution='&copy; Google'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxNativeZoom={18}
          />
        )}
        {mapMode === 'terrain' && (
          <TileLayer
            key="terrain"
            attribution='&copy; Google'
            url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            maxNativeZoom={18}
          />
        )}
        {mapMode === 'map' && (
          <TileLayer
            key="carto"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
        )}
        
        {statesGeoJson && (
          <GeoJSON 
            key="states" 
            data={statesGeoJson} 
            style={geoJsonStyle} 
            onEachFeature={onEachState} 
          />
        )}

        {borderMesh && (
          <GeoJSON 
            key={`borders-${selected.geoName}`} 
            data={borderMesh} 
            style={{ color: '#ef4444', weight: 0.4, opacity: selected.id !== 'IN' ? 0.5 : 0.8, fill: false }}
            interactive={false}
          />
        )}

        <DistrictBordersLayer districtMesh={districtMesh} selectedGeoName={selected.geoName} mapMode={mapMode} />

        {selectedDistrictsGeoJson && (
          <GeoJSON
            key={`districts-interactive-${selected.geoName}`}
            data={selectedDistrictsGeoJson as any}
            style={{ weight: 0, opacity: 0, fillOpacity: 0, fillColor: 'transparent' }}
            onEachFeature={(feature, layer) => {
              layer.on('mouseover', (e: any) => {
                const districtName = feature.properties.dt_name || feature.properties.district || feature.properties.name;
                const districtData = STATE_DISTRICTS[selected.geoName]?.find((d: any) => d.name === districtName);
                const svg = e.originalEvent.target.closest('.leaflet-container');
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                setTooltip({
                  x: e.originalEvent.clientX - rect.left, 
                  y: e.originalEvent.clientY - rect.top, 
                  name: districtName, 
                  score: districtData?.health
                });
              });
              layer.on('mouseout', () => setTooltip(null));
            }}
          />
        )}
        <MapController selected={selected} stateGeoJson={statesGeoJson} />
      </MapContainer>
    </div>
  );
});
