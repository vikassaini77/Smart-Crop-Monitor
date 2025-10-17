import React, { useState } from "react";
import "../styles/EntryScreen.css";

function EntryScreen({ onEnter }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => onEnter(), 1600); // wait for animation to finish
  };

  return (
    <div className={`entry-screen ${clicked ? "fade-out" : ""}`} onClick={handleClick}>
      <div className="entry-overlay"></div>

      <div className={`entry-content ${clicked ? "zoom-out" : ""}`}>
        <div className={`entry-logo ${clicked ? "morph" : ""}`}>
          <span className="emoji">🌱</span>
        </div>

        <h1 className="entry-title">Smart Crop Monitor</h1>
        <p className="entry-tagline">Empowering AI Agriculture 🌾</p>

        <div className="entry-hint">
          <span className="click-text">Click anywhere to begin</span>
          <div className="pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default EntryScreen;
