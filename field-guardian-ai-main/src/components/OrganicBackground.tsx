import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const OrganicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let fireflies: { x: number; y: number; vx: number; vy: number; radius: number; phase: number }[] = [];
    const maxFireflies = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize fireflies
    for (let i = 0; i < maxFireflies; i++) {
      fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 1) * 0.3, // Mostly float upwards
        radius: Math.random() * 2.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];
        
        // Pulsing opacity
        f.phase += 0.02;
        const opacity = (Math.sin(f.phase) + 1) / 2 * 0.8 + 0.2;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(167, 243, 208, ${opacity})`;
        ctx.fillStyle = `rgba(167, 243, 208, ${opacity})`;
        ctx.fill();
        
        // Reset shadow for next operations if any
        ctx.shadowBlur = 0;

        // Gentle drift
        f.x += f.vx + Math.sin(f.phase * 0.5) * 0.2; // Wavy motion
        f.y += f.vy;

        // Wrap around
        if (f.y < -10) f.y = canvas.height + 10;
        if (f.x < -10) f.x = canvas.width + 10;
        if (f.x > canvas.width + 10) f.x = -10;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-background" style={{ zIndex: 0 }}>
      {/* Soft emerald gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at top right, hsl(160 30% 12%) 0%, hsl(140 40% 4%) 100%)",
        }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Canvas Layer for Fireflies */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* God Rays Overlay */}
      <motion.div 
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] opacity-20 mix-blend-screen"
        style={{
          background: "conic-gradient(from 180deg at 20% 20%, transparent 0deg, hsl(160 50% 50% / 0.1) 45deg, transparent 90deg)",
        }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] z-20" />
    </div>
  );
};

export default OrganicBackground;
