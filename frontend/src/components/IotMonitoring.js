import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Card, ProgressBar, Row, Col, Spinner } from 'react-bootstrap';
import { gsap } from 'gsap'; // <-- Import GSAP
import { toast } from 'react-toastify';
import { getWeatherData } from '../services/weatherService';
import '../styles/IotMonitoring.css';

// --- Health Score Gauge Component (Now powered by GSAP) ---
const HealthGauge = ({ score }) => {
  const gaugeMeterRef = useRef(null);
  
  const getScoreColor = (s) => {
    if (s > 75) return "#28a745";
    if (s > 40) return "#ffc107";
    return "#dc3545";
  };
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;

  useLayoutEffect(() => {
    const strokeDashoffset = circumference - (score / 100) * circumference;
    // Use GSAP to animate the gauge
    gsap.to(gaugeMeterRef.current, {
      strokeDashoffset: strokeDashoffset,
      duration: 1.5,
      ease: 'circ.out'
    });
  }, [score, circumference]);

  return (
    <div className="health-gauge-container">
      <svg className="health-gauge-svg" viewBox="0 0 100 55">
        <path className="gauge-background-arc" d="M 5 50 A 45 45, 0, 0, 1, 95 50" />
        <path
          ref={gaugeMeterRef}
          className="gauge-meter-arc"
          d="M 5 50 A 45 45, 0, 0, 1, 95 50"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference} // Start empty
        />
      </svg>
      <div className="health-score-label">
        <div className="health-score-value" style={{ color }}>{Math.round(score)}%</div>
        <div className="health-score-text">Overall Farm Health</div>
      </div>
    </div>
  );
};

// --- Main IotMonitoring Component ---
function IotMonitoring() {
    const [sensorData, setSensorData] = useState({ temp: null, humidity: null, moisture: 45 });
    const [log, setLog] = useState([]);
    const [healthScore, setHealthScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const logContainerRef = useRef(null);

    useEffect(() => {
        const fetchLiveWeatherData = () => {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported.");
                setIsLoading(false);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const weatherData = await getWeatherData(latitude, longitude);
                        setSensorData({
                            temp: weatherData.temperature,
                            humidity: weatherData.humidity,
                            moisture: 30 + Math.random() * 40,
                        });
                        setLog(prev => [{ time: new Date().toLocaleTimeString(), msg: `Live data loaded for ${weatherData.location}.`, type: "info" }, ...prev]);
                    } catch (error) {
                        toast.error("Could not fetch live data.");
                    } finally {
                        setIsLoading(false);
                    }
                },
                () => {
                    toast.warn("Location access denied. Using default data.");
                    setIsLoading(false);
                    setSensorData({ temp: 24, humidity: 60, moisture: 45 });
                }
            );
        };
        fetchLiveWeatherData();
    }, []);
    function IotMonitoring() {
  return (
    <div className="iot-monitoring">
      <h2 className="section-title">IoT Monitoring Center</h2>
      <WaterManagementWidget />
    </div>
  );
}

    useEffect(() => {
        if (sensorData.temp !== null) {
            let score = 100;
            if (sensorData.temp > 30 || sensorData.temp < 18) score -= 30;
            if (sensorData.humidity > 70 || sensorData.humidity < 50) score -= 30;
            if (sensorData.moisture < 40) score -= 15;
            setHealthScore(Math.max(0, score));
        }
    }, [sensorData]);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
        }
    }, [log]);

    return (
        <>
            <h2 className="card-title-custom">Live Insights & Trends</h2>
            {isLoading ? (
                <div className="loading-overlay">
                    <Spinner animation="border" />
                    <p className="mt-2">Waiting for location...</p>
                </div>
            ) : (
                <>
                    <HealthGauge score={healthScore} />
                    <div className="condition-log-container" ref={logContainerRef}>
                        {log.length > 0 ? log.map((entry, index) => (
                            <div key={index} className={`log-entry ${entry.type}`}>
                                <span className="log-time">{entry.time}</span>
                                <span className="log-msg">{entry.msg}</span>
                            </div>
                        )) : <div className="log-entry info"><span className="log-msg">Initializing...</span></div>}
                    </div>
                    <Row className="sensor-readouts">
                        <Col xs={6} className="sensor-item">
                            <h6>Temperature</h6>
                            <p>{sensorData.temp !== null ? `${sensorData.temp.toFixed(1)}°C` : 'N/A'}</p>
                        </Col>
                        <Col xs={6} className="sensor-item">
                            <h6>Humidity</h6>
                            <p>{sensorData.humidity !== null ? `${sensorData.humidity.toFixed(1)}%` : 'N/A'}</p>
                        </Col>
                    </Row>
                    <div className="soil-moisture-wrapper mt-3">
                        <h6 className="text-center">Soil Moisture</h6>
                        <ProgressBar now={sensorData.moisture} label={`${Math.round(sensorData.moisture)}%`} variant="info" animated />
                    </div>
                </>
            )}
        </>
    );
}

export default IotMonitoring;

