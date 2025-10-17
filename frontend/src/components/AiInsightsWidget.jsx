import React, { useRef, useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, Legend } from "recharts";
import { gsap } from "gsap";

const INITIAL_DATA = [
  { month: "Feb", Predicted: 320, Actual: 310 },
  { month: "Mar", Predicted: 350, Actual: 360 },
  { month: "Apr", Predicted: 380, Actual: 365 },
];

export default function AiInsightsWidget() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const [data, setData] = useState(INITIAL_DATA);

  const animateChart = () => {
    if (!containerRef.current) return;

    // Animate chart lines
    const paths = containerRef.current.querySelectorAll(".recharts-line path");
    if (!paths.length) {
      requestAnimationFrame(animateChart);
      return;
    }

    paths.forEach((path, i) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.6, delay: i * 0.3, ease: "power3.out" });
    });

    // Animate dots
    const dots = containerRef.current.querySelectorAll(".recharts-dot");
    gsap.fromTo(dots, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.04, ease: "back.out(1.4)" });

    // Animate widget title glow
    gsap.to(titleRef.current, { opacity: 0.85, scale: 1.03, repeat: -1, yoyo: true, duration: 1.8, ease: "sine.inOut" });

    // Animate widget card glow
    gsap.to(containerRef.current, { boxShadow: "0 0 25px rgba(0, 255, 255, 0.35)", repeat: -1, yoyo: true, duration: 2, ease: "sine.inOut" });
  };

  useEffect(() => {
    const t = setTimeout(animateChart, 50);
    return () => clearTimeout(t);
  }, [data]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(row => {
        const jitter = () => Math.round(Math.random() * 18 - 9);
        return { ...row, Predicted: Math.max(200, row.Predicted + jitter()), Actual: Math.max(200, row.Actual + jitter()) };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="widget-card ai-widget" ref={containerRef}>
      <h3 className="widget-title" ref={titleRef}>AI Insights & Yield Prediction</h3>
      <p className="ai-recommendation">"Optimal planting conditions detected for Zone B. Recommend seeding within 48 hours."</p>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="month" stroke="#bbb" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid #00eaff" }} labelStyle={{ color: "#fff" }} />
          <Legend />
          <Line type="monotone" dataKey="Predicted" stroke="#00eaff" strokeWidth={3} dot={{ r: 3, fill: "#00eaff" }} isAnimationActive={false} />
          <Line type="monotone" dataKey="Actual" stroke="#00ffa2" strokeWidth={3} dot={{ r: 3, fill: "#00ffa2" }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
