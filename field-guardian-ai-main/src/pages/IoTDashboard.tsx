import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplets, Thermometer, Wind, Sun, AlertTriangle, Activity, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightIntensity: number;
}

interface SensorAlert {
  id: string;
  message: string;
  severity: "warning" | "critical";
  timestamp: Date;
}

const getStatus = (value: number, low: number, high: number) => {
  if (value < low || value > high) return "critical";
  if (value < low + (high - low) * 0.2 || value > high - (high - low) * 0.2) return "warning";
  return "normal";
};

const statusColors = {
  normal: "border-glow-green/30 shadow-[0_0_15px_hsl(var(--glow-green)/0.1)]",
  warning: "border-sunlight/30 shadow-[0_0_15px_hsl(var(--sunlight)/0.1)]",
  critical: "border-destructive/30 shadow-[0_0_15px_hsl(var(--destructive)/0.1)]",
};

const statusDot = { normal: "bg-glow-green", warning: "bg-sunlight", critical: "bg-destructive" };

const IoTDashboard = () => {
  const { toast } = useToast();
  const [data, setData] = useState<SensorData>({ soilMoisture: 55, temperature: 28, humidity: 65, lightIntensity: 600 });
  const [history, setHistory] = useState<(SensorData & { time: string })[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const prevAlertRef = useRef<string>("");

  const generateData = useCallback((): SensorData => ({
    soilMoisture: Math.max(10, Math.min(95, data.soilMoisture + (Math.random() - 0.5) * 8)),
    temperature: Math.max(15, Math.min(48, data.temperature + (Math.random() - 0.5) * 3)),
    humidity: Math.max(20, Math.min(95, data.humidity + (Math.random() - 0.5) * 6)),
    lightIntensity: Math.max(50, Math.min(1200, data.lightIntensity + (Math.random() - 0.5) * 100)),
  }), [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateData();
      setData(newData);
      setHistory((prev) => [...prev.slice(-29), { ...newData, time: new Date().toLocaleTimeString() }]);

      // Check alerts
      const newAlerts: SensorAlert[] = [];
      if (newData.soilMoisture < 30) newAlerts.push({ id: crypto.randomUUID(), message: `🚨 Low soil moisture (${newData.soilMoisture.toFixed(0)}%) — Irrigation needed!`, severity: "critical", timestamp: new Date() });
      else if (newData.soilMoisture < 40) newAlerts.push({ id: crypto.randomUUID(), message: `⚠️ Soil moisture dropping (${newData.soilMoisture.toFixed(0)}%) — Monitor closely`, severity: "warning", timestamp: new Date() });
      if (newData.temperature > 40) newAlerts.push({ id: crypto.randomUUID(), message: `🚨 Extreme heat (${newData.temperature.toFixed(1)}°C) — Heat stress risk!`, severity: "critical", timestamp: new Date() });
      else if (newData.temperature > 35) newAlerts.push({ id: crypto.randomUUID(), message: `⚠️ High temperature (${newData.temperature.toFixed(1)}°C) — Provide shade`, severity: "warning", timestamp: new Date() });
      if (newData.humidity > 85) newAlerts.push({ id: crypto.randomUUID(), message: `⚠️ High humidity (${newData.humidity.toFixed(0)}%) — Fungal disease risk`, severity: "warning", timestamp: new Date() });

      if (newAlerts.length > 0) {
        const key = newAlerts.map((a) => a.message).join("|");
        if (key !== prevAlertRef.current) {
          prevAlertRef.current = key;
          setAlerts((prev) => [...newAlerts, ...prev].slice(0, 20));
          toast({ title: newAlerts[0].message });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [generateData, toast]);

  const sensors = [
    { label: "Soil Moisture", value: data.soilMoisture, unit: "%", icon: Droplets, status: getStatus(data.soilMoisture, 30, 80), format: (v: number) => v.toFixed(0) },
    { label: "Temperature", value: data.temperature, unit: "°C", icon: Thermometer, status: getStatus(data.temperature, 18, 38), format: (v: number) => v.toFixed(1) },
    { label: "Humidity", value: data.humidity, unit: "%", icon: Wind, status: getStatus(data.humidity, 30, 85), format: (v: number) => v.toFixed(0) },
    { label: "Light Intensity", value: data.lightIntensity, unit: "lux", icon: Sun, status: getStatus(data.lightIntensity, 200, 1000), format: (v: number) => v.toFixed(0) },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">IoT Farm Monitor</h1>
          <p className="text-muted-foreground">Real-time sensor data from your smart farm</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-2 h-2 bg-glow-green rounded-full animate-pulse" />
            <span className="text-xs text-glow-green">Live — Updating every 2s</span>
          </div>
        </motion.div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {sensors.map((sensor, i) => {
            const Icon = sensor.icon;
            return (
              <motion.div key={sensor.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`glass-card rounded-2xl p-5 border ${statusColors[sensor.status]} transition-all duration-500`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusDot[sensor.status]} ${sensor.status !== "normal" ? "animate-pulse" : ""}`} />
                    <span className="text-xs text-muted-foreground capitalize">{sensor.status}</span>
                  </div>
                </div>
                <p className="text-3xl font-display text-foreground mb-1">
                  {sensor.format(sensor.value)}<span className="text-sm text-muted-foreground ml-1">{sensor.unit}</span>
                </p>
                <p className="text-sm text-muted-foreground">{sensor.label}</p>
                {/* Mini bar */}
                <div className="mt-3 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${sensor.status === "critical" ? "bg-destructive" : sensor.status === "warning" ? "bg-sunlight" : "bg-glow-green"}`} animate={{ width: `${Math.min(100, (sensor.value / (sensor.unit === "lux" ? 1200 : 100)) * 100)}%` }} transition={{ duration: 0.5 }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alerts + History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg text-foreground">Smart Alerts</h2>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No alerts — all sensors normal ✅</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className={`text-sm p-3 rounded-xl ${alert.severity === "critical" ? "bg-destructive/10 border border-destructive/20" : "bg-sunlight/10 border border-sunlight/20"}`}>
                    <p className="text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.timestamp.toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* History table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg text-foreground">Recent Readings</h2>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/30">
                    <th className="text-left py-2 px-2">Time</th>
                    <th className="text-right py-2 px-2">Moisture</th>
                    <th className="text-right py-2 px-2">Temp</th>
                    <th className="text-right py-2 px-2">Humidity</th>
                    <th className="text-right py-2 px-2">Light</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice().reverse().slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-border/10 text-foreground">
                      <td className="py-1.5 px-2 text-muted-foreground">{row.time}</td>
                      <td className="text-right py-1.5 px-2">{row.soilMoisture.toFixed(0)}%</td>
                      <td className="text-right py-1.5 px-2">{row.temperature.toFixed(1)}°C</td>
                      <td className="text-right py-1.5 px-2">{row.humidity.toFixed(0)}%</td>
                      <td className="text-right py-1.5 px-2">{row.lightIntensity.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* AI Tip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 glass-card rounded-2xl p-5 border border-primary/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-display text-sm text-foreground mb-1">AI Tip</p>
              <p className="text-sm text-muted-foreground">
                Ask CropAI: <em>"Do my crops need water?"</em> — The AI assistant uses live IoT data to give you smart, real-time recommendations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IoTDashboard;
