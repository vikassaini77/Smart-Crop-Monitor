import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/LivingBackground.css';

// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

function LivingBackground() {
  const backgroundRef = useRef(null);

  useLayoutEffect(() => {
    // We create a GSAP context to safely manage our animations and cleanup
    const ctx = gsap.context(() => {
      // --- THE MASTER SCROLL TIMELINE ---
      // This timeline controls the entire day-to-night cycle based on scroll position
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5, // Smoothly links the animation to the scrollbar
        }
      });

      // --- Scene Transitions controlled by scroll ---
      masterTl
        // Transition from Morning (rain) to Afternoon (data rain)
        .to(".rain", { opacity: 0 }, 0.25) // Fade out normal rain at 25% scroll
        .fromTo(".data-rain", { opacity: 0 }, { opacity: 1 }, 0.25) // Fade in data rain at 25%
        
        // Transition from Afternoon (data rain) to Night (IoT nodes)
        .to(".data-rain", { opacity: 0 }, 0.6) // Fade out data rain at 60%
        .to(".growing-plant", { opacity: 0 }, 0.6) // Fade out the plant at 60%
        .fromTo(".iot-nodes", { opacity: 0 }, { opacity: 1 }, 0.7); // Fade in IoT nodes at 70%

      // Animate the sky color through the scroll
      masterTl.to(backgroundRef.current, { 
          background: 'linear-gradient(to bottom, #a8e063, #56ab2f)', // Morning
          ease: 'none'
      }, 0);
      masterTl.to(backgroundRef.current, {
          background: 'linear-gradient(to bottom, #fde6a8, #f5b041)', // Afternoon
          ease: 'none'
      }, 0.3);
      masterTl.to(backgroundRef.current, {
          background: 'linear-gradient(to bottom, #141e30, #243b55)', // Night
          ease: 'none'
      }, 0.6);

      // --- Continuous Looping Animations (independent of scroll) ---
      gsap.to(".raindrop, .data-particle", { y: "110vh", duration: 1, repeat: -1, stagger: 0.05, ease: "none" });
      gsap.to(".iot-node", { scale: 1.2, opacity: 0.5, yoyo: true, repeat: -1, duration: 2, stagger: 0.3 });
      
      const plantTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      plantTl.fromTo(".growing-plant", { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 3, ease: 'power2.out' })
             .to(".growing-plant", { opacity: 0, duration: 2, delay: 5 });

    }, backgroundRef);

    return () => ctx.revert(); // Cleanup GSAP animations on component unmount
  }, []);

  return (
    <div className="living-background" ref={backgroundRef}>
      {/* --- Layer 1: Natural Rain --- */}
      <div className="rain">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="raindrop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${0.5 + Math.random() * 0.5}s` }}></div>
        ))}
      </div>

      {/* --- Layer 2: Data Rain --- */}
      <div className="data-rain">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="data-particle" style={{ left: `${Math.random() * 100}%` }}></div>
        ))}
      </div>

      {/* --- Layer 3: IoT Nodes --- */}
      <div className="iot-nodes">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="iot-node" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}></div>
        ))}
      </div>

      {/* --- Layer 4: The Growing Plant --- */}
      <svg className="growing-plant" width="80" height="120" viewBox="0 0 80 120">
        <path d="M40 120 V50" stroke="var(--accent-color)" strokeWidth="4" />
        <path d="M40 70 C 20 60, 20 40, 40 50" fill="var(--accent-color)" />
        <path d="M40 70 C 60 60, 60 40, 40 50" fill="var(--accent-color)" />
      </svg>
    </div>
  );
}

export default LivingBackground;

