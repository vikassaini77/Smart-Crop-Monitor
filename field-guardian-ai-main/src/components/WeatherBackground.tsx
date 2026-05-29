import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WeatherBackgroundProps {
  condition: string;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const isRainy = /rain|drizzle|shower|thunder/i.test(condition);
  const isCloudy = /cloud|overcast/i.test(condition) || isRainy;
  const isNight = /night|moon|clear-night/i.test(condition);
  const isClear = /clear|sun/i.test(condition) && !isRainy && !isNight;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // HTML5 Canvas Engine for Rain Physics
  useEffect(() => {
    if (!isRainy) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let raindrops: { x: number; y: number; len: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize drops
    for (let i = 0; i < 150; i++) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 20 + 15,
        speed: Math.random() * 20 + 15,
        opacity: Math.random() * 0.35 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(200, 220, 255, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";

      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.len * 0.15, drop.y + drop.len); // Wind angle
        ctx.strokeStyle = `rgba(200, 220, 255, ${drop.opacity})`;
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += drop.speed * 0.15; // Horizontal wind push

        if (drop.y > canvas.height) {
          drop.y = -drop.len;
          drop.x = Math.random() * canvas.width;
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRainy]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-background" style={{ zIndex: 0 }}>
      {/* Base Sky Gradient depending on weather */}
      <motion.div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: isClear
            ? "linear-gradient(180deg, hsl(45 50% 12%) 0%, hsl(132 30% 5%) 100%)"
            : isNight
            ? "linear-gradient(180deg, hsl(230 40% 6%) 0%, hsl(240 30% 2%) 100%)"
            : isRainy
            ? "linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(132 30% 4%) 100%)"
            : "linear-gradient(180deg, hsl(200 15% 12%) 0%, hsl(132 30% 5%) 100%)",
        }}
      />

      {/* Stars for Night Weather */}
      {isNight && (
        <motion.div
          className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='1' fill='white' opacity='0.8'/%3E%3Ccircle cx='150' cy='120' r='1.5' fill='white' opacity='0.6'/%3E%3Ccircle cx='250' cy='60' r='1' fill='white' opacity='0.9'/%3E%3Ccircle cx='320' cy='180' r='2' fill='white' opacity='0.4'/%3E%3Ccircle cx='80' cy='250' r='1' fill='white' opacity='0.7'/%3E%3Ccircle cx='200' cy='320' r='1.5' fill='white' opacity='0.8'/%3E%3Ccircle cx='350' cy='350' r='1' fill='white' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Moon for Night Weather */}
      {isNight && (
        <motion.div
          className="absolute -top-10 -right-10 w-64 h-64 rounded-full mix-blend-screen"
          style={{
            background: "radial-gradient(circle at 30% 30%, hsl(220 40% 90%) 0%, hsl(220 30% 70%) 20%, transparent 60%)",
            boxShadow: "0 0 100px 20px hsl(220 40% 60% / 0.2)"
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      )}

      {/* Sun Rays for Clear Weather */}
      {isClear && (
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] opacity-30 mix-blend-screen"
          style={{
            background: "radial-gradient(circle at 65% 25%, hsl(45 100% 65% / 0.5) 0%, transparent 50%)",
          }}
          animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Panning Clouds Layer 1 */}
      {isCloudy && (
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cpath d='M200,200 Q250,120 350,150 Q450,100 550,180 Q650,150 700,220 Q750,300 650,320 Q550,380 400,340 Q250,380 150,300 Q80,220 200,200' fill='white' filter='url(%23blur)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "800px 400px",
            backgroundPosition: "top center",
          }}
          animate={{ backgroundPositionX: ["0px", "-800px"] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {/* Panning Clouds Layer 2 (Faster parallax) */}
      {isCloudy && (
        <motion.div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='blur2'%3E%3CfeGaussianBlur stdDeviation='15'/%3E%3C/filter%3E%3Cpath d='M100,100 Q150,50 250,80 Q350,30 450,100 Q550,80 600,150 Q650,250 550,280 Q450,320 300,300 Q150,320 50,250 Q-20,150 100,100' fill='white' filter='url(%23blur2)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "1200px 600px",
            backgroundPosition: "top right",
          }}
          animate={{ backgroundPositionX: ["0px", "-1200px"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Rain Canvas Layer */}
      {isRainy && <canvas ref={canvasRef} className="absolute inset-0 z-10" />}
      
      {/* Heavy Vignette to keep focus on UI center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)] z-20 pointer-events-none" />
    </div>
  );
};

export default WeatherBackground;
