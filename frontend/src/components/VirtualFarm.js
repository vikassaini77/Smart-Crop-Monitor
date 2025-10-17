import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTemperatureHigh, FaCloudsmith, FaWater } from 'react-icons/fa'; // Icons for the tooltip
import '../styles/VirtualFarm.css';

const initialFarmData = [
  { id: 1, name: 'Corn Field - Zone A', health: 'good', temp: 24, humidity: 65, moisture: 55 },
  { id: 2, name: 'Soybean Field - Zone B', health: 'fair', temp: 28, humidity: 72, moisture: 45 },
  { id: 3, name: 'Wheat Field - Zone C', health: 'good', temp: 23, humidity: 68, moisture: 60 },
  { id: 4, name: 'Vegetable Patch', health: 'poor', temp: 31, humidity: 80, moisture: 35, alert: 'High pest risk detected!' },
];

function VirtualFarm() {
  const [farmData, setFarmData] = useState(initialFarmData);
  const [selectedPlot, setSelectedPlot] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFarmData(prevData => prevData.map(plot => {
        const newHealthRoll = Math.random();
        let newHealth = plot.health;
        if (newHealthRoll > 0.9) newHealth = 'poor';
        else if (newHealthRoll > 0.7) newHealth = 'fair';
        else newHealth = 'good';
        return { ...plot, health: newHealth };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlotHover = (plot) => {
    setSelectedPlot(plot);
  };
  const handlePlotLeave = () => {
    setSelectedPlot(null);
  };
  
  const getHealthClass = (health) => {
    if (health === 'good') return 'good';
    if (health === 'fair') return 'fair';
    return 'poor';
  };

  return (
    <div className="virtual-farm-container">
      <svg className="farm-map" viewBox="0 0 400 300">
        <defs>
          <pattern id="fieldTexture" patternUnits="userSpaceOnUse" width="10" height="10">
            <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* The Farm Plots */}
        <path d="M20,20 Q 30,10 180,25 L 175, 140 Q 165,150 20,135 Z" className={`farm-plot ${getHealthClass(farmData[0].health)}`} onMouseEnter={() => handlePlotHover(farmData[0])} onMouseLeave={handlePlotLeave} />
        <path d="M220,25 Q 230,15 380,20 L 385, 135 Q 375,145 220,140 Z" className={`farm-plot ${getHealthClass(farmData[1].health)}`} onMouseEnter={() => handlePlotHover(farmData[1])} onMouseLeave={handlePlotLeave} />
        <path d="M20,160 Q 30,150 180,165 L 175, 280 Q 165,290 20,275 Z" className={`farm-plot ${getHealthClass(farmData[2].health)}`} onMouseEnter={() => handlePlotHover(farmData[2])} onMouseLeave={handlePlotLeave} />
        <path d="M220,165 Q 230,155 380,160 L 385, 275 Q 375,285 220,280 Z" className={`farm-plot ${getHealthClass(farmData[3].health)}`} onMouseEnter={() => handlePlotHover(farmData[3])} onMouseLeave={handlePlotLeave} />

        {/* Ambient Animation: A Wind Turbine */}
        <g className="wind-turbine" transform="translate(350, 5)">
            <path d="M0 25 V 0" stroke="var(--text-secondary)" strokeWidth="2" />
            <g className="turbine-blades">
                <path d="M0 0 L -10 -5" stroke="var(--text-secondary)" strokeWidth="1.5" />
                <path d="M0 0 L 10 -5" stroke="var(--text-secondary)" strokeWidth="1.5" />
                <path d="M0 0 L 0 10" stroke="var(--text-secondary)" strokeWidth="1.5" />
            </g>
        </g>
      </svg>

      {/* The Rich Tooltip */}
      <AnimatePresence>
        {selectedPlot && (
          <motion.div className="farm-tooltip-rich" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <h5>{selectedPlot.name}</h5>
            <div className={`tooltip-status ${getHealthClass(selectedPlot.health)}`}>Status: {selectedPlot.health.toUpperCase()}</div>
            <div className="tooltip-data">
              <div><FaTemperatureHigh /> {selectedPlot.temp}°C</div>
              <div><FaCloudsmith /> {selectedPlot.humidity}%</div>
              <div><FaWater /> {selectedPlot.moisture}%</div>
            </div>
            {selectedPlot.alert && <div className="tooltip-alert">{selectedPlot.alert}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VirtualFarm;

