"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { bookData } from '../../../data/bookData';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function GlobalCoveragePage({ isActive, side = "left" }: { isActive: boolean, side?: "left" | "right" }) {
  const data = bookData.globalCoverage;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Example marker coordinates for the map
  const markers = [
    { coordinates: [-74.006, 40.7128] }, // NY
    { coordinates: [-0.1276, 51.5074] }, // London
    { coordinates: [139.6917, 35.6895] }, // Tokyo
    { coordinates: [103.8198, 1.3521] }, // Singapore
    { coordinates: [37.6173, 55.7558] }, // Moscow
    { coordinates: [-43.1729, -22.9068] }, // Rio
  ];

  return (
    <div className="h-full w-full p-8 pt-12 flex flex-col relative overflow-hidden bg-[#0a1816]">
      {side === "left" && (
        <motion.h2 
          initial={{ opacity: 0, y: -10 }} 
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          className="text-2xl font-bold mb-6 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider relative z-20"
        >
          {data.title}
        </motion.h2>
      )}

      {/* Actual World Map visualization spanning 200% width */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 bottom-0 z-10 flex items-center justify-center opacity-80"
        style={{
          width: "200%",
          left: side === "left" ? "0%" : "-100%",
          paddingTop: "2rem" // Leave space for header if on left
        }}
      >
        {isActive && (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 105, center: [0, 15] }}
            width={800}
            height={500}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#132d29"
                    stroke="#35b89a"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#1b4840", outline: "none" },
                      pressed: { outline: "none" }
                    }}
                  />
                ))
              }
            </Geographies>

            {markers.map(({ coordinates }, i) => (
              <Marker key={i} coordinates={coordinates as [number, number]}>
                <motion.circle
                  r={4}
                  fill="#89dbc2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 2, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                <circle r={2} fill="#ffffff" />
              </Marker>
            ))}
          </ComposableMap>
        )}
      </motion.div>

      {side === "left" && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          className="grid grid-cols-2 gap-3 relative z-20 mt-auto"
        >
          {data.stats.map((item, i) => (
            <motion.div key={i} variants={itemVariants} className="text-center p-2 bg-[#17332e] bg-opacity-90 border border-white/5 rounded-lg shadow-lg">
              <div className="text-[#35b89a] font-bold text-lg">{item.val}</div>
              <div className="text-[9px] uppercase opacity-60 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
