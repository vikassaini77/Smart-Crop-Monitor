import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import * as Tone from 'tone';
import '../styles/CinematicPreloader.css';

function CinematicPreloader({ onLoaded }) {
  const preloaderRef = useRef(null);
  const seedRef = useRef(null);
  const stemRef = useRef(null);
  const leaf1Ref = useRef(null);
  const leaf2Ref = useRef(null);
  const scannerRef = useRef(null);
  const logoRef = useRef(null);

  // useLayoutEffect is better for animations to prevent flashes
  useLayoutEffect(() => {
    // This is a GSAP Timeline. It's like a video editor for code.
    const tl = gsap.timeline({
      onComplete: () => {
        // When the entire timeline is finished, tell App.js to show the site
        setTimeout(() => onLoaded(), 500);
      }
    });

    // We chain animations together one after another.
    tl
      // Phase 1: The Seed Falls
      .fromTo(seedRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'bounce.out' })
      .add(() => { // Play sound at this point in the timeline
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease("C4", "8n");
      }, "-=0.2") // Play 0.5s before the seed animation ends

      // Phase 2: The Sprout Grows
      .to(stemRef.current, { scaleY: 1, duration: 0.2, ease: 'power2.out' })
      .to(leaf1Ref.current, { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(1.7)' })
      .to(leaf2Ref.current, { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(1.7)' }, "-=0.3") // Overlap animations slightly

      // Phase 3: The AI Scan
      .to([seedRef.current, stemRef.current, leaf1Ref.current, leaf2Ref.current], { opacity: 0, duration: 0.3 })
      .fromTo(scannerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      .add(() => {
        const scannerSound = new Tone.AMSynth().toDestination();
        scannerSound.triggerAttackRelease("C6", "0.5");
      })
      .fromTo('.scanner-line', { y: -50 }, { y: 50, duration: 1, ease: 'power1.inOut' })
      .to(scannerRef.current, { opacity: 0, duration: 0.3 })

      // Phase 4 & 5: The Logo Reveal
      .fromTo(logoRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.50)' })
      .add(() => {
        const chime = new Tone.MetalSynth().toDestination();
        chime.triggerAttackRelease("C5", "4n");
      })
      .to(preloaderRef.current, { opacity: 0, duration: 0.5, delay: 0.2 }); // Fade out the entire preloader

  }, [onLoaded]);

  return (
    <div className="cinematic-preloader" ref={preloaderRef}>
      {/* Seed and Sprout */}
      <svg width="150" height="200" viewBox="0 0 150 200">
        <circle ref={seedRef} cx="75" cy="120" r="10" fill="#28a745" style={{ opacity: 0 }} />
        <path ref={stemRef} d="M75 120 V150" stroke="#28a745" strokeWidth="4" style={{ transformOrigin: 'top', scaleY: 0 }} />
        <path ref={leaf1Ref} d="M75 120 C 90 110, 95 95, 75 70" fill="#28a745" style={{ transformOrigin: '75px 120px', scale: 0, opacity: 0 }} />
        <path ref={leaf2Ref} d="M75 120 C 60 110, 55 95, 75 70" fill="#28a745" style={{ transformOrigin: '75px 120px', scale: 0, opacity: 0 }} />
      </svg>

      {/* Scanner */}
      <div className="scanner" ref={scannerRef} style={{ opacity: 0, position: 'absolute' }}>
        <div className="scanner-line"></div>
        <p>ANALYZING...</p>
      </div>

      {/* Final Logo */}
      <h1 className="final-logo" ref={logoRef} style={{ opacity: 0, position: 'absolute' }}>
        🌱 Smart Crop Monitor
      </h1>
    </div>
  );
}

export default CinematicPreloader;

