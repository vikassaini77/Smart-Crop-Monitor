// src/pages/Home.jsx
import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import sections
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import TechStack from '../components/TechStack';
import AboutSummary from '../components/AboutSummary';

import '../styles/Home.css';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const mainRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.glass-section');

      sections.forEach((section, index) => {
        // --- Section entrance animation ---
        gsap.fromTo(
          section,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );

        // --- Animate child elements with stagger ---
        const children = section.querySelectorAll('.animate-child');
        if (children.length > 0) {
          gsap.fromTo(
            children,
            { y: 30, opacity: 0, scale: 0.97 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.9,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
              },
            }
          );
        }

        // --- Subtle floating parallax per section ---
        const floatSpeed = 4 + Math.random() * 2; // 4-6 sec per float
        gsap.to(section, {
          y: '+=8',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          duration: floatSpeed,
          delay: index * 0.2,
        });
      });

      // --- Hero title word-by-word reveal ---
      const heroWords = gsap.utils.toArray('.hero-title .word');
      if (heroWords.length > 0) {
        gsap.fromTo(
          heroWords,
          { y: 120, opacity: 0, rotation: 5 },
          {
            y: 0,
            opacity: 1,
            rotation: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power4.out',
          }
        );
      }

      // --- Glass overlay glow pulse ---
      gsap.to('.glass-overlay', {
        boxShadow: '0 0 80px 30px rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px)',
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: 'sine.inOut',
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-container" ref={mainRef}>
      {/* Glass overlay for subtle glow */}
      <div className="glass-overlay"></div>

      {/* Hero Section */}
      <div className="glass-section scroll-section">
        <Hero />
      </div>

      {/* Features Section */}
      <div className="glass-section scroll-section">
        <Features />
      </div>

      {/* How It Works Section */}
      <div className="glass-section scroll-section">
        <HowItWorks />
      </div>

      {/* Tech Stack Section */}
      <div className="glass-section scroll-section">
        <TechStack />
      </div>

      {/* About Summary Section */}
      <div className="glass-section scroll-section">
        <AboutSummary />
      </div>
    </div>
  );
}

export default Home;
