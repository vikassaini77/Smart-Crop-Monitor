import React from 'react';
// THE FIX IS HERE: We add 'Line' to the list of imports
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, Line } from 'recharts';

// A custom animated dot for the "live" data point
const LivePulseDot = ({ cx, cy }) => {
  if (cx === null || cy === null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r="8" fill="rgba(255, 193, 7, 0.3)" className="pulse-ring" />
      <circle cx={cx} cy={cy} r="4" fill="#ffc107" stroke="#fff" strokeWidth="2" />
    </g>
  );
};

// This component now displays a beautiful, insightful area chart
function LiveChart({ data, dataKey, strokeColor }) {
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            {/* This creates the beautiful gradient fill */}
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize="0.8rem" />
          <YAxis stroke="var(--text-secondary)" fontSize="0.8rem" domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background-secondary)', 
              border: '1px solid var(--border-color)' 
            }}
          />

          {/* This is the "Optimal Zone" shading */}
          <ReferenceArea y1={18} y2={30} fill="#28a745" fillOpacity={0.1} label={{ value: 'Optimal', position: 'insideTopLeft', fill: '#28a745', fontSize: '0.8rem' }} />

          {/* This is the main data area with the gradient fill */}
          <Area type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
          
          {/* This adds our custom "live" pulse to the last point */}
          <Line dataKey={dataKey} stroke="transparent" activeDot={<LivePulseDot />} isAnimationActive={false} />

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LiveChart;

