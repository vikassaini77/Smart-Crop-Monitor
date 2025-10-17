import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../styles/WeatherWidget.css";

const WeatherWidget = ({ weatherData }) => {
  const sunRef = useRef(null);
  const cloudRefs = useRef([]);
  const raindropRefs = useRef([]);

  // Clear previous refs
  cloudRefs.current = [];
  raindropRefs.current = [];

  const addCloudRef = (el) => {
    if (el && !cloudRefs.current.includes(el)) cloudRefs.current.push(el);
  };

  const addRaindropRef = (el) => {
    if (el && !raindropRefs.current.includes(el)) raindropRefs.current.push(el);
  };

  useEffect(() => {
    // --- SUN ---
    if (weatherData.condition === "sunny") {
      gsap.to(sunRef.current, {
        opacity: 1,
        duration: 1.2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    } else {
      gsap.to(sunRef.current, { opacity: 0, duration: 0.8 });
    }

    // --- CLOUDS ---
    cloudRefs.current.forEach((cloud) => {
      if (weatherData.condition === "cloudy" || weatherData.condition === "rainy") {
        gsap.to(cloud, {
          opacity: 1,
          x: "+=30",
          duration: 20,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else {
        gsap.to(cloud, { opacity: 0, duration: 0.8 });
      }
    });

    // --- RAINDROPS ---
    raindropRefs.current.forEach((drop, index) => {
      if (weatherData.condition === "rainy") {
        gsap.to(drop, {
          opacity: 1,
          y: 200,
          duration: 1.2,
          ease: "linear",
          repeat: -1,
          delay: index * 0.15, // stagger for realism
          onRepeat: () => gsap.set(drop, { y: -20 }),
        });
      } else {
        gsap.to(drop, { opacity: 0, y: -20, duration: 0.8 });
      }
    });
  }, [weatherData]);

  return (
    <div className="weather-widget">
      <div className="weather-animation-container">
        <div ref={sunRef} className="sun"></div>

        <div ref={addCloudRef} className="cloud cloud-1"></div>
        <div ref={addCloudRef} className="cloud cloud-2"></div>

        <div className="raindrops">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} ref={addRaindropRef} className="raindrop" />
          ))}
        </div>
      </div>

      <div className="weather-content-overlay">
        <div className="weather-info">
          <h1>{Math.round(weatherData.temp)}°C</h1>
          <p>{weatherData.location}</p>
          <p className="condition-text">{weatherData.condition}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
