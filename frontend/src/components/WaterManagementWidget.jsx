'use client';
import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaWarehouse } from 'react-icons/fa';
import './SmartCommandCenter.css';

function WaterManagementWidget() {
  const [reservoirLevel, setReservoirLevel] = useState(85);
  const waterRef = useRef(null);
  const waveRef = useRef(null);

  useLayoutEffect(() => {
    // Animate rising water level
    gsap.fromTo(
      waterRef.current,
      { yPercent: 100 },
      {
        yPercent: 100 - reservoirLevel,
        duration: 2,
        ease: 'power3.out',
      }
    );

    // Continuous wave motion
    gsap.to(waveRef.current, {
      attr: {
        d: 'M0,15 C25,5 25,25 50,15 S75,5 100,15 V100 H0 Z',
      },
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }, [reservoirLevel]);

  // Simulate sensor fluctuation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setReservoirLevel(prev => {
        const change = (Math.random() * 10 - 5);
        return Math.min(100, Math.max(40, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="widget-card water-widget">
      <h3 className="widget-title">
        <FaWarehouse /> Water Management
      </h3>

      <div className="water-reservoir">
        <svg className="reservoir-svg" viewBox="0 5 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waterGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0077ff" />
              <stop offset="100%" stopColor="#00eaff" />
            </linearGradient>
          </defs>

          <g ref={waterRef}>
            <path
              ref={waveRef}
              d="M0,15 C25,25 25,5 50,15 S75,25 100,15 V100 H0 Z"
              fill="url(#waterGradient1)"
            />
          </g>

          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            stroke="#00ffff55"
            strokeWidth="2"
            fill="transparent"
          />
        </svg>

        <div className="reservoir-label">{Math.round(reservoirLevel)}%</div>

        {/* Rising bubbles */}
        <div className="bubbles">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                left: `${Math.random() * 90 + 5}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="water-status">
        <div className="status-item">
          <span>System Status</span>
          <strong className="status-ok">ACTIVE</strong>
        </div>
      </div>
    </div>
  );
}

export default WaterManagementWidget;
