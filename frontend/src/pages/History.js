import React, { useState, useMemo } from 'react';
import { Container, Card } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import '../styles/History.css';

const mockHistoryData = [
  { id: 1, pest: 'Aphids', zone: 'Zone A', date: '2025-10-05', imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600&auto=format&fit=crop' },
  { id: 2, pest: 'Powdery Mildew', zone: 'Zone C', date: '2025-10-04', imageUrl: 'https://images.unsplash.com/photo-1597996327290-9584b4218844?q=80&w=600&auto=format&fit=crop' },
  { id: 3, pest: 'Aphids', zone: 'Zone A', date: '2025-09-28', imageUrl: 'https://images.unsplash.com/photo-1594222162534-9a7e283a37c9?q=80&w=600&auto=format&fit=crop' },
  { id: 4, pest: 'Ants', zone: 'Zone B', date: '2025-09-25', imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop' },
  { id: 5, pest: 'Aphids', zone: 'Zone C', date: '2025-09-15', imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600&auto=format&fit=crop' },
  { id: 6, pest: 'Healthy Plant', zone: 'Zone B', date: '2025-09-12', imageUrl: 'https://images.unsplash.com/photo-1594222162534-9a7e283a37c9?q=80&w=600&auto=format&fit=crop' },
];

function History() {
  const [activeView, setActiveView] = useState('log');
  const [filters, setFilters] = useState({ pest: 'all', zone: 'all' });

  const filteredData = useMemo(() => {
    return mockHistoryData.filter(item => {
      const pestMatch = filters.pest === 'all' || item.pest === filters.pest;
      const zoneMatch = filters.zone === 'all' || item.zone === filters.zone;
      return pestMatch && zoneMatch;
    });
  }, [filters]);

  const analysis = useMemo(() => {
    const pestCounts = filteredData.reduce((acc, item) => {
      if (item.pest !== 'Healthy Plant') {
        acc[item.pest] = (acc[item.pest] || 0) + 1;
      }
      return acc;
    }, {});

    const mostCommonPest = Object.keys(pestCounts).length > 0
      ? Object.keys(pestCounts).reduce((a, b) => pestCounts[a] > pestCounts[b] ? a : b)
      : 'N/A';

    const chartData = Object.entries(pestCounts).map(([name, count]) => ({ name, count }));

    return { 
      totalDetections: filteredData.filter(i => i.pest !== 'Healthy Plant').length, 
      mostCommonPest, 
      chartData 
    };
  }, [filteredData]);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="history-page">
      {/* Glowing particles */}
      <div className="floating-glow" />
      <div className="floating-glow" />
      <div className="floating-glow" />

      <Container>
        {/* Title */}
        <motion.h1 className="history-title" variants={fadeIn} initial="hidden" animate="show">
          Crop Health & Pest History
        </motion.h1>

        {/* Filters */}
        <motion.div className="glass-box filter-controls" variants={fadeIn} initial="hidden" animate="show">
          <div className="filter-group">
            <label>Filter by Pest</label>
            <select name="pest" onChange={handleFilterChange} value={filters.pest}>
              <option value="all">All Pests</option>
              <option value="Aphids">Aphids</option>
              <option value="Powdery Mildew">Powdery Mildew</option>
              <option value="Ants">Ants</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Zone</label>
            <select name="zone" onChange={handleFilterChange} value={filters.zone}>
              <option value="all">All Zones</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
            </select>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div className="summary-grid" variants={fadeIn} initial="hidden" animate="show">
          <motion.div className="glass-box" whileHover={{ scale: 1.05 }}>
            <h5>Total Detections</h5>
            <h2 className="summary-value">{analysis.totalDetections}</h2>
          </motion.div>

          <motion.div className="glass-box" whileHover={{ scale: 1.05 }}>
            <h5>Most Common Pest</h5>
            <h2 className="summary-value">{analysis.mostCommonPest}</h2>
          </motion.div>
        </motion.div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button className={activeView === 'log' ? 'active' : ''} onClick={() => setActiveView('log')}>Log</button>
          <button className={activeView === 'chart' ? 'active' : ''} onClick={() => setActiveView('chart')}>Chart</button>
        </div>

        {/* Log / Chart View */}
        {activeView === 'log' ? (
          <motion.div className="history-log-grid grid-3x3" variants={fadeIn} initial="hidden" animate="show">
            {filteredData.map(entry => (
              <motion.div key={entry.id} className="glass-box history-card" whileHover={{ scale: 1.02 }}>
                <div className="history-image-container">
                  <img src={entry.imageUrl} alt={entry.pest} className="history-image" />
                </div>
                <Card.Body>
                  <Card.Title className={`history-result ${entry.pest === 'Healthy Plant' ? 'healthy' : 'pest'}`}>
                    {entry.pest}
                  </Card.Title>
                  <Card.Text className="history-date">
                    {new Date(entry.date).toLocaleDateString()} &nbsp;•&nbsp; {entry.zone}
                  </Card.Text>
                </Card.Body>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div className="glass-box chart-card" variants={fadeIn} initial="hidden" animate="show">
            <h3 className="chart-header">Detections by Pest Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analysis.chartData}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis allowDecimals={false} stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }} />
                <Bar dataKey="count" fill="#00f5ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </Container>
    </div>
  );
}

export default History;
