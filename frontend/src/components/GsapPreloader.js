import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "../styles/GsapPreloader.css";

function GsapPreloader({ onLoaded }) {
  const preloaderRef = useRef(null);
  const svgRef = useRef(null);
  const seedRef = useRef(null);
  const plantGroupRef = useRef(null);
  const rootsGroupRef = useRef(null);
  const dronesGroupRef = useRef(null);
  const iotNetworkRef = useRef(null);
  const glowParticlesRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.8,
            onComplete: onLoaded,
          });
        },
      });

      // 🌱 SEED FALL & BURST
      tl.from(seedRef.current, {
        y: -300,
        opacity: 0,
        duration: 1.2,
        ease: "bounce.out",
      })
        .to(seedRef.current, {
          scale: 1.4,
          filter: "drop-shadow(0 0 15px #00ff88)",
          duration: 0.5,
          yoyo: true,
          repeat: 1,
        })
        .to(seedRef.current, { opacity: 0.7 }, "<");

      // 🌿 PLANT GROWTH + ROOT SPREAD
      tl.from(plantGroupRef.current.children, {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 1,
        stagger: 0.2,
      }).from(
        rootsGroupRef.current.children,
        {
          opacity: 0,
          strokeDasharray: 50,
          strokeDashoffset: 50,
          duration: 1.2,
          stagger: 0.15,
        },
        "-=0.6"
      );

      // 🌊 DATA WAVES + PARTICLES
      tl.fromTo(
        glowParticlesRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 1.2,
          repeat: 2,
          yoyo: true,
          ease: "sine.inOut",
        },
        "-=0.6"
      );

      // 🚁 DRONE SCANNING
      tl.from(dronesGroupRef.current.children, {
        x: (i) => (i === 0 ? -300 : 300),
        duration: 2.5,
        ease: "power1.inOut",
        opacity: 0,
      }).to(
        ".scan-beam",
        {
          scaleY: 1,
          opacity: 0.7,
          duration: 1.2,
          repeat: 1,
          yoyo: true,
          transformOrigin: "top",
        },
        "-=2"
      );

      // 🌌 IOT NETWORK APPEARANCE
      tl.to(
        [
          plantGroupRef.current,
          rootsGroupRef.current,
          dronesGroupRef.current,
          seedRef.current,
          "#soil-line",
        ],
        { opacity: 0, duration: 0.8 }
      ).from(
        iotNetworkRef.current.children,
        {
          scale: 0,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(2)",
        },
        "-=0.5"
      );

      // 🎥 CAMERA ZOOM-OUT (futuristic dashboard transition)
      tl.to(svgRef.current, {
        scale: 1.3,
        transformOrigin: "center center",
        opacity: 0.6,
        duration: 1,
        ease: "power2.inOut",
      });
    }, preloaderRef);

    return () => ctx.revert();
  }, [onLoaded]);

  return (
    <div id="preloader-container" ref={preloaderRef}>
      <svg ref={svgRef} className="animation-svg" viewBox="0 0 800 600">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,255,136,0)" />
            <stop offset="50%" stopColor="rgba(0,255,136,0.6)" />
            <stop offset="100%" stopColor="rgba(0,255,136,0)" />
          </linearGradient>
        </defs>

        <line
          id="soil-line"
          x1="0"
          y1="400"
          x2="800"
          y2="400"
          stroke="#5d4037"
          strokeWidth="2"
        />

        {/* 🌱 Seed */}
        <circle
          ref={seedRef}
          className="seed-glow"
          cx="400"
          cy="400"
          r="8"
          fill="#00ff88"
          filter="url(#glow)"
        />

        {/* 🌿 Plant */}
        <g ref={plantGroupRef}>
          <path className="plant-stem" d="M400 400 L400 350" fill="#00ff88" />
          <path
            className="plant-leaf"
            d="M400 370 C 380 360, 380 340, 400 350"
            fill="#00ff88"
          />
          <path
            className="plant-leaf"
            d="M400 370 C 420 360, 420 340, 400 350"
            fill="#00ff88"
          />
        </g>

        {/* 🌾 Roots */}
        <g ref={rootsGroupRef}>
          <path
            d="M400 400 Q 380 420, 360 440"
            stroke="#0077ff"
            strokeWidth="1"
            opacity="0.8"
            fill="none"
          />
          <path
            d="M400 400 Q 420 420, 440 440"
            stroke="#0077ff"
            strokeWidth="1"
            opacity="0.8"
            fill="none"
          />
          <path
            d="M360 440 Q 350 450, 340 460"
            stroke="#0077ff"
            strokeWidth="1"
            opacity="0.8"
            fill="none"
          />
          <path
            d="M440 440 Q 450 450, 460 460"
            stroke="#0077ff"
            strokeWidth="1"
            opacity="0.8"
            fill="none"
          />
        </g>

        {/* ✨ Energy Particles */}
        <g ref={glowParticlesRef}>
          <circle cx="390" cy="380" r="2" fill="#00ffcc" />
          <circle cx="410" cy="370" r="2" fill="#00ffcc" />
          <circle cx="395" cy="360" r="2" fill="#00ffcc" />
          <circle cx="405" cy="355" r="2" fill="#00ffcc" />
        </g>

        {/* 🚁 Drones */}
        <g ref={dronesGroupRef}>
          <g id="drone1" transform="translate(400, 200)">
            <rect
              className="drone-body"
              x="-15"
              y="-5"
              width="30"
              height="10"
              rx="2"
              fill="#e0e0e0"
            />
            <polygon
              className="scan-beam"
              points="-15,5 15,5 30,30 -30,30"
              fill="url(#scanGradient)"
            />
          </g>
          <g id="drone2" transform="translate(400, 250)">
            <rect
              className="drone-body"
              x="-15"
              y="-5"
              width="30"
              height="10"
              rx="2"
              fill="#e0e0e0"
            />
            <polygon
              className="scan-beam"
              points="-15,5 15,5 30,30 -30,30"
              fill="url(#scanGradient)"
            />
          </g>
        </g>

        {/* 🌐 IoT Network */}
        <g ref={iotNetworkRef}>
          <circle className="iot-node" cx="200" cy="200" r="4" fill="#00ff88" />
          <circle className="iot-node" cx="600" cy="200" r="4" fill="#00ff88" />
          <circle className="iot-node" cx="400" cy="100" r="4" fill="#00ff88" />
          <circle className="iot-node" cx="300" cy="300" r="4" fill="#00ff88" />
          <circle className="iot-node" cx="500" cy="300" r="4" fill="#00ff88" />
          <line
            className="iot-line"
            x1="200"
            y1="200"
            x2="400"
            y2="100"
            stroke="rgba(0, 255, 136, 0.3)"
            strokeWidth="0.5"
          />
          <line
            className="iot-line"
            x1="600"
            y1="200"
            x2="400"
            y2="100"
            stroke="rgba(0, 255, 136, 0.3)"
            strokeWidth="0.5"
          />
          <line
            className="iot-line"
            x1="200"
            y1="200"
            x2="300"
            y2="300"
            stroke="rgba(0, 255, 136, 0.3)"
            strokeWidth="0.5"
          />
          <line
            className="iot-line"
            x1="300"
            y1="300"
            x2="500"
            y2="300"
            stroke="rgba(0, 255, 136, 0.3)"
            strokeWidth="0.5"
          />
          <line
            className="iot-line"
            x1="500"
            y1="300"
            x2="600"
            y2="200"
            stroke="rgba(0, 255, 136, 0.3)"
            strokeWidth="0.5"
          />
        </g>
      </svg>
    </div>
  );
}

export default GsapPreloader;
