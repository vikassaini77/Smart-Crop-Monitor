import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const AuroraBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; radius: number; speedX: number; speedY: number; opacity: number; phase: number }[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create Golden Pollen/Dust Particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speedX: Math.random() * 0.4 + 0.1, // Slow drift right
        speedY: (Math.random() - 0.5) * 0.2, // Very slight vertical drift
        opacity: Math.random(),
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Wavy pulsing opacity
        p.phase += 0.02;
        const currentOpacity = (Math.sin(p.phase) * 0.5 + 0.5) * p.opacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        // Premium gold color
        ctx.fillStyle = `rgba(212, 175, 55, ${currentOpacity * 0.8})`; 
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(212, 175, 55, ${currentOpacity * 0.4})`;
        ctx.fill();

        p.x += p.speedX + Math.sin(p.phase * 0.5) * 0.1;
        p.y += p.speedY + Math.cos(p.phase * 0.3) * 0.1;

        // Wrap around smoothly
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, backgroundColor: "#060A06" }}>
      
      {/* Deep elegant emerald-to-black gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,40,25,1)_0%,rgba(5,8,5,1)_100%)]" />
      
      {/* Golden soft glow highlights */}
      <motion.div 
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full mix-blend-screen opacity-20 filter blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.8) 0%, transparent 70%)" }}
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full mix-blend-screen opacity-10 filter blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(167,243,208,0.6) 0%, transparent 70%)" }}
        animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Topographic Map SVG Pattern for an agricultural/mapping feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 Q50,0 100,50 T200,50' fill='none' stroke='%23FFFFFF' stroke-width='0.5'/%3E%3Cpath d='M0,100 Q50,50 100,100 T200,100' fill='none' stroke='%23FFFFFF' stroke-width='0.5'/%3E%3Cpath d='M0,150 Q50,100 100,150 T200,150' fill='none' stroke='%23FFFFFF' stroke-width='0.5'/%3E%3Cpath d='M0,25 Q50,-25 100,25 T200,25' fill='none' stroke='%23FFFFFF' stroke-width='0.5'/%3E%3Cpath d='M0,75 Q50,25 100,75 T200,75' fill='none' stroke='%23FFFFFF' stroke-width='0.5'/%3E%3Cpath d='M0,125 Q50,75 100,125 T200,125' fill='none' stroke='%23FFFFFF' stroke-width='0.5'/%3E%3Cpath d='M0,175 Q50,125 100,175 T200,175' fill='none' stroke='%23FFFFFF' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '400px 400px',
        }}
      />

      {/* Canvas Layer for Golden Dust */}
      <canvas ref={canvasRef} className="absolute inset-0 z-20" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] z-30" />
    </div>
  );
};

export default AuroraBackground;
