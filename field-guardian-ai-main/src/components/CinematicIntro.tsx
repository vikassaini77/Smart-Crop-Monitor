import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Scene data ─── */
const scenes = [
  {
    id: "dawn",
    text: "Every day begins with hope...",
    gradient: "radial-gradient(ellipse at 50% 80%, hsl(30 55% 20%) 0%, hsl(25 40% 12%) 30%, hsl(220 25% 6%) 70%, hsl(240 20% 4%) 100%)",
    particleHue: 35,
    tint: "transparent",
    fogOpacity: 0.12,
  },
  {
    id: "field",
    text: "Every step carries responsibility...",
    gradient: "radial-gradient(ellipse at 40% 65%, hsl(45 45% 22%) 0%, hsl(35 30% 14%) 30%, hsl(120 18% 10%) 60%, hsl(140 20% 6%) 100%)",
    particleHue: 45,
    tint: "transparent",
    fogOpacity: 0.08,
  },
  {
    id: "threat",
    text: "But unseen threats grow silently...",
    gradient: "radial-gradient(ellipse at 55% 55%, hsl(80 12% 14%) 0%, hsl(120 10% 8%) 40%, hsl(160 8% 5%) 70%, hsl(0 10% 4%) 100%)",
    particleHue: 70,
    tint: "hsla(0, 40%, 15%, 0.1)",
    fogOpacity: 0.06,
  },
  {
    id: "hope",
    text: "What if you could see the unseen?",
    gradient: "radial-gradient(ellipse at 50% 60%, hsl(120 30% 16%) 0%, hsl(110 25% 12%) 40%, hsl(130 20% 8%) 70%, hsl(140 18% 5%) 100%)",
    particleHue: 120,
    tint: "hsla(120, 50%, 30%, 0.06)",
    fogOpacity: 0.04,
  },
];

/* ─── Letter-by-letter text ─── */
const CinematicText = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const letters = useMemo(() => text.split(""), [text]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center px-6 md:px-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 1 }}
        >
          <p className="text-center max-w-3xl leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
            {letters.map((char, i) => (
              <motion.span
                key={`${text}-${i}`}
                className="inline-block text-xl md:text-3xl lg:text-5xl"
                style={{
                  color: "hsl(var(--foreground))",
                  textShadow: "0 2px 30px hsla(var(--wheat), 0.25)",
                }}
                initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.04,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Canvas particle system (organic dust/pollen/seeds) ─── */
const useParticleCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  hue: number,
  active: boolean
) => {
  const particlesRef = useRef<
    Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number;
      type: "dust" | "pollen" | "seed";
    }>
  >([]);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const types: Array<"dust" | "pollen" | "seed"> = ["dust", "pollen", "seed"];

    for (let i = 0; i < 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      particlesRef.current.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.25 - 0.05,
        size: type === "seed" ? Math.random() * 2.5 + 1.5 : Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
        life: Math.random() * 300,
        maxLife: 350 + Math.random() * 250,
        type,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particlesRef.current.forEach((p) => {
        p.x += p.vx + Math.sin(p.life * 0.008) * 0.12;
        p.y += p.vy;
        p.life++;

        const ratio = p.life / p.maxLife;
        const fadeIn = Math.min(ratio * 5, 1);
        const fadeOut = ratio > 0.8 ? 1 - (ratio - 0.8) / 0.2 : 1;
        const alpha = p.opacity * fadeIn * fadeOut;

        if (p.life > p.maxLife) { p.x = Math.random() * W; p.y = H + 10; p.life = 0; }
        if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }

        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.type === "pollen") {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grd.addColorStop(0, `hsla(${hue + 20}, 45%, 60%, 0.7)`);
          grd.addColorStop(1, `hsla(${hue + 20}, 45%, 60%, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "seed") {
          ctx.fillStyle = `hsla(${hue + 10}, 25%, 50%, 0.5)`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size * 0.4, p.size, Math.sin(p.life * 0.015) * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `hsla(${hue}, 20%, 55%, 0.4)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      particlesRef.current = [];
    };
  }, [canvasRef, hue, active]);
};

/* ─── Crop silhouettes ─── */
const CropSilhouettes = ({ scene }: { scene: string }) => {
  const stalks = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      left: `${3 + i * 6}%`,
      height: 50 + Math.random() * 90,
      delay: i * 0.06,
      sway: 2 + Math.random() * 3,
    })), []);

  const isHealthy = scene === "hope" || scene === "dawn" || scene === "field";
  const color = isHealthy
    ? "hsl(var(--leaf))"
    : scene === "threat"
    ? "hsl(var(--destructive) / 0.4)"
    : "hsl(var(--muted-foreground) / 0.3)";

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: "22%" }}>
      {stalks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0"
          style={{
            left: s.left,
            width: 3,
            height: s.height,
            background: `linear-gradient(to top, ${color}, transparent)`,
            borderRadius: "50% 50% 0 0",
            transformOrigin: "bottom center",
          }}
          animate={{ rotate: [-(s.sway * 0.4), s.sway * 0.4, -(s.sway * 0.4)] }}
          transition={{ duration: 3.5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >
          <div className="absolute" style={{ top: "22%", left: -7, width: 14, height: 6, background: color, borderRadius: "50%", transform: "rotate(-18deg)", opacity: 0.6 }} />
          <div className="absolute" style={{ top: "48%", right: -7, width: 12, height: 5, background: color, borderRadius: "50%", transform: "rotate(22deg)", opacity: 0.5 }} />
        </motion.div>
      ))}
    </div>
  );
};

/* ─── Volumetric light rays ─── */
const LightRays = ({ scene }: { scene: string }) => {
  if (scene === "threat") return null;
  const isHope = scene === "hope";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: 0,
            left: `${20 + i * 22}%`,
            width: isHope ? 100 : 70,
            height: "100%",
            background: `linear-gradient(180deg, hsla(${isHope ? 120 : 42}, ${isHope ? 45 : 30}%, ${isHope ? 45 : 55}%, ${isHope ? 0.07 : 0.035}) 0%, transparent 55%)`,
            transform: `rotate(${-10 + i * 10}deg)`,
            transformOrigin: "top center",
          }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4.5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
        />
      ))}
    </div>
  );
};

/* ─── Fog layer ─── */
const FogLayer = ({ opacity }: { opacity: number }) => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    style={{
      background: "radial-gradient(ellipse at 50% 90%, hsla(30, 20%, 60%, 0.15) 0%, transparent 60%)",
    }}
    animate={{ opacity: [opacity, opacity * 1.5, opacity] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* ─── Main Component ─── */
const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [currentScene, setCurrentScene] = useState(-1);
  const [showLogo, setShowLogo] = useState(false);
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeScene = currentScene >= 0 && currentScene < scenes.length ? scenes[currentScene] : null;
  useParticleCanvas(canvasRef, activeScene?.particleHue ?? 35, currentScene >= 0 && !showLogo);

  const doExit = useCallback(() => {
    setExiting(true);
    sessionStorage.setItem("intro_seen", "true");
    setTimeout(onComplete, 1200);
  }, [onComplete]);

  useEffect(() => {
    if (sessionStorage.getItem("intro_seen")) { onComplete(); return; }

    const timers: ReturnType<typeof setTimeout>[] = [];
    // Scene durations: dawn 2.5s, field 2.5s, threat 2s, hope 2s → logo 2.5s → exit
    const durations = [2500, 2500, 2000, 2000];
    let t = 800; // initial black

    timers.push(setTimeout(() => setCurrentScene(0), t));
    durations.forEach((dur, i) => {
      if (i > 0) timers.push(setTimeout(() => setCurrentScene(i), t));
      t += dur;
    });

    timers.push(setTimeout(() => { setShowLogo(true); setCurrentScene(-2); }, t));
    timers.push(setTimeout(doExit, t + 2800));

    return () => timers.forEach(clearTimeout);
  }, [onComplete, doExit]);

  if (sessionStorage.getItem("intro_seen")) return null;

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 bg-background"
          style={{ zIndex: 100 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Background gradient */}
          <AnimatePresence mode="wait">
            {activeScene && (
              <motion.div key={activeScene.id} className="absolute inset-0" style={{ background: activeScene.gradient }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} />
            )}
            {showLogo && (
              <motion.div key="logo-bg" className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(var(--leaf)) 0%, hsl(var(--background)) 70%)", opacity: 0.4 }}
                initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 1.5 }} />
            )}
          </AnimatePresence>

          {/* Tint */}
          {activeScene?.tint && activeScene.tint !== "transparent" && (
            <motion.div className="absolute inset-0" style={{ background: activeScene.tint }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
          )}

          {/* Fog */}
          {activeScene && <FogLayer opacity={activeScene.fogOpacity} />}

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 35%, hsla(0,0%,0%,0.65) 100%)" }} />

          {/* Light rays */}
          {activeScene && <LightRays scene={activeScene.id} />}
          {showLogo && <LightRays scene="hope" />}

          {/* Crop silhouettes */}
          {activeScene && <CropSilhouettes scene={activeScene.id} />}
          {showLogo && <CropSilhouettes scene="hope" />}

          {/* Particles */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />

          {/* Film grain */}
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              zIndex: 6, opacity: 0.035,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Letterbox bars */}
          <div className="absolute top-0 left-0 right-0 h-[7vh]" style={{ background: "linear-gradient(180deg, hsl(0 0% 0%) 0%, transparent 100%)", zIndex: 7 }} />
          <div className="absolute bottom-0 left-0 right-0 h-[7vh]" style={{ background: "linear-gradient(0deg, hsl(0 0% 0%) 0%, transparent 100%)", zIndex: 7 }} />

          {/* Scene text */}
          <div className="relative z-10 w-full h-full">
            {scenes.map((scene, i) => (
              <CinematicText key={scene.id} text={scene.text} isActive={currentScene === i && !showLogo} />
            ))}
          </div>

          {/* Logo reveal */}
          <AnimatePresence>
            {showLogo && (
              <motion.div className="absolute inset-0 flex items-center justify-center z-20"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <div className="text-center">
                  {/* Glow */}
                  <motion.div className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    <div style={{ width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, hsla(var(--glow-green), 0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="relative w-18 h-18 md:w-22 md:h-22 mx-auto mb-5 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ background: "linear-gradient(135deg, hsl(var(--wheat)), hsl(var(--accent)))", boxShadow: "0 0 50px hsla(var(--accent), 0.25), 0 8px 32px hsla(0,0%,0%,0.4)" }}
                    initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
                  >
                    <span className="text-3xl md:text-4xl">🌱</span>
                  </motion.div>

                  {/* Title */}
                  <div className="relative">
                    {"Smart Crop Monitor".split("").map((char, i) => (
                      <motion.span key={i} className="inline-block text-3xl md:text-5xl lg:text-6xl text-gradient"
                        style={{ fontFamily: "var(--font-display)", filter: "drop-shadow(0 2px 8px hsla(var(--wheat), 0.25))" }}
                        initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px) drop-shadow(0 2px 8px hsla(var(--wheat), 0.25))" }}
                        transition={{ duration: 0.45, delay: 0.4 + i * 0.035, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </div>

                  {/* Tagline */}
                  <motion.p
                    className="mt-3 md:mt-5 text-base md:text-xl font-light tracking-[0.2em] uppercase text-leaf-foreground"
                    style={{ fontFamily: "var(--font-body)", color: "hsl(var(--leaf-foreground))" }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.8 }}
                  >
                    AI Protecting Every Leaf
                  </motion.p>

                  {/* Line */}
                  <motion.div className="mx-auto mt-5"
                    style={{ height: 1, background: "linear-gradient(90deg, transparent, hsl(var(--wheat) / 0.4), transparent)" }}
                    initial={{ width: 0 }} animate={{ width: 180 }}
                    transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip */}
          <motion.button
            className="fixed bottom-6 right-6 text-xs tracking-widest uppercase z-30 text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
            whileHover={{ opacity: 1 }} transition={{ delay: 1.5 }}
            onClick={doExit}
          >
            Skip →
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="fixed inset-0 bg-background" style={{ zIndex: 100 }}
          initial={{ opacity: 1 }} animate={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }} />
      )}
    </AnimatePresence>
  );
};

export default CinematicIntro;
