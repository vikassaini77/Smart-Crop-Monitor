// src/App.js
import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Tone from "tone";

// Component Imports
import NavbarComponent from "./components/navbar";
import EntryScreen from "./components/EntryScreen";
import GsapPreloader from "./components/GsapPreloader";
import LivingBackground from "./components/LivingBackground";
import Footer from "./components/Footer";
import ScrollToTopButton from "./components/ScrollToTopButton";
import AnimatedCursor from "./components/AnimatedCursor";

// Lazy-loaded pages for performance
const Home = lazy(() => import("./pages/Home"));
const SmartCommandCenter = lazy(() => import("./pages/SmartCommandCenter"));
const About = lazy(() => import("./components/about"));
const History = lazy(() => import("./pages/History"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const GlobalStats = lazy(() => import("./pages/GlobalStats"));

import "./styles/App.css";

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  // Initialize Tone.js audio context on entry
  const handleEnter = async () => {
    try {
      await Tone.start();
    } catch (err) {
      console.warn("⚠️ Tone.js failed to start, continuing without audio.", err);
    } finally {
      setHasEntered(true);
    }
  };

  const handlePreloaderLoaded = () => setLoading(false);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "light" : "dark");
  };

  // EntryScreen
  if (!hasEntered) return <EntryScreen onEnter={handleEnter} />;

  // GSAP preloader
  if (loading) return <GsapPreloader onLoaded={handlePreloaderLoaded} />;

  return (
    <Router>
      <div className={`App ${theme}-theme`}>
        {/* Living animated background */}
        <LivingBackground />

        {/* Custom animated cursor */}
        <AnimatedCursor />

        {/* Toast notifications */}
        <ToastContainer theme={theme} position="top-right" autoClose={3000} hideProgressBar />

        {/* Navbar with theme toggle */}
        <NavbarComponent theme={theme} toggleTheme={toggleTheme} />

        <div className="page-container">
          <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/dashboard" element={<SmartCommandCenter />} />
              <Route path="/history" element={<History />} />
              <Route path="/stats" element={<GlobalStats />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Suspense>
        </div>

        {/* Footer */}
        <Footer />

        {/* Scroll to top button */}
        <ScrollToTopButton />
      </div>
    </Router>
  );
}

export default App;
