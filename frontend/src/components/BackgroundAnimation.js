import React, { useMemo, useEffect } from 'react'; // <-- THE FIX IS HERE
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; 

// This component uses tsparticles to create a subtle, interactive background
function BackgroundAnimation({ theme }) {
  // Memoize the options to prevent re-renders on theme change
  const options = useMemo(() => {
    // Determine colors based on the current theme
    const particleColor = theme === 'dark' ? "#ffffff" : "#333333";
    const linkColor = theme === 'dark' ? "#ffffff" : "#555555";

    return {
      background: {
        color: {
          value: "transparent", // The background should be transparent
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: particleColor,
        },
        links: {
          color: linkColor,
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 50, // Keep the number of particles low for a subtle effect
        },
        opacity: {
          value: 0.3,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    };
  }, [theme]); // Re-calculate only when the theme changes

  // Initialize the particles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  return <Particles id="tsparticles" options={options} />;
}

export default BackgroundAnimation;

