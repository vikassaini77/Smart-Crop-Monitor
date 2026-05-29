import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Bug, Droplets, Thermometer, TrendingUp, AlertTriangle, Activity, Eye, Bell } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import DataMeshBackground from "@/components/DataMeshBackground";
import { API_BASE_URL } from "@/lib/api";


const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const StatCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string; color: string; sub?: string }) => (
  <motion.div
    variants={itemVariants}
    className="glass-card rounded-2xl p-5 glow-pulse bg-background/20 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all cursor-default"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {sub && <span className="text-xs text-glow-green font-medium">{sub}</span>}
    </div>
    <p className="text-2xl font-display text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

interface Detection {
  id: string;
  pest_name: string | null;
  disease_name: string | null;
  confidence: number | null;
  severity: string | null;
  suggested_action: string | null;
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
  message: string | null;
  severity: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ total: 0, pests: 0, healthy: 0, highRisk: 0 });
  const [iotStatus, setIotStatus] = useState({ led: false, buzzer: false, motor: false, status: "Standby" });

  useEffect(() => {
    const fetchIoT = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/iot_status`);
        if (res.ok) {
          const data = await res.json();
          setIotStatus(data);
        }
      } catch (err) {}
    };
    fetchIoT();
    const interval = setInterval(fetchIoT, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();

    // Realtime
    const detChannel = supabase
      .channel("dashboard-detections")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "detections" }, (payload) => {
        setDetections((prev) => [payload.new as Detection, ...prev].slice(0, 10));
        updateStats();
      })
      .subscribe();

    const alertChannel = supabase
      .channel("dashboard-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload) => {
        setAlerts((prev) => [payload.new as Alert, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(detChannel);
      supabase.removeChannel(alertChannel);
    };
  }, []);

  const fetchData = async () => {
    const [detectionsRes, alertsRes] = await Promise.all([
      supabase.from("detections").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    if (detectionsRes.data) setDetections(detectionsRes.data);
    if (alertsRes.data) setAlerts(alertsRes.data);
    updateStats();
  };

  const updateStats = async () => {
    const { data, count } = await supabase
      .from("detections")
      .select("severity, pest_name, disease_name", { count: "exact" });

    if (data) {
      const pests = data.filter((d) => d.pest_name && d.pest_name !== "None").length;
      const highRisk = data.filter((d) => d.severity === "high" || d.severity === "critical").length;
      const healthy = data.filter((d) => d.pest_name === "None" && d.disease_name === "None").length;
      setStats({ total: count || 0, pests, healthy, highRisk });
    }
  };

  // Build chart data from real detections (group by day)
  const chartData = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const grouped: Record<string, { health: number; pests: number; count: number }> = {};
    days.forEach((d) => (grouped[d] = { health: 0, pests: 0, count: 0 }));

    detections.forEach((det) => {
      const day = days[new Date(det.created_at).getDay()];
      grouped[day].count++;
      if (det.pest_name && det.pest_name !== "None") grouped[day].pests++;
      grouped[day].health += det.confidence || 0;
    });

    return days.map((d) => ({
      day: d,
      health: grouped[d].count > 0 ? Math.round(grouped[d].health / grouped[d].count) : 90,
      pests: grouped[d].pests,
    }));
  })();

  const healthPercent = detections.length > 0
    ? Math.round(detections.filter((d) => d.severity === "low" || (!d.pest_name || d.pest_name === "None")).length / detections.length * 100)
    : 100;

  const alertColors: Record<string, string> = {
    critical: "hsl(0 70% 50%)",
    high: "hsl(30 80% 50%)",
    medium: "hsl(45 80% 55%)",
    low: "hsl(120 50% 45%)",
  };

  return (
    <div className="relative min-h-screen">
      <DataMeshBackground />
      <main className="pt-20 pb-12 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl mb-2 tracking-tight">
            Farm <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            {detections.length > 0
              ? `Live data from ${stats.total} detections.`
              : "Run your first detection to see real data here."}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <StatCard icon={HeartPulse} label="Crop Health" value={`${healthPercent}%`} color="hsl(120 50% 45%)" />
          <StatCard icon={Bug} label="Pests Detected" value={`${stats.pests}`} color="hsl(0 70% 50%)" />
          <StatCard icon={Droplets} label="Total Scans" value={`${stats.total}`} color="hsl(200 70% 55%)" />
          <StatCard icon={AlertTriangle} label="High Risk" value={`${stats.highRisk}`} color="hsl(45 80% 55%)" />
        </motion.div>

        {/* Arduino Relay Status */}
        <motion.div
          className="glass-card rounded-2xl p-6 mb-8 bg-background/20 backdrop-blur-xl border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-glow-green" />
            <h3 className="font-display text-2xl text-foreground tracking-tight">Hardware Control Relays</h3>
            <span className={`text-xs ml-auto font-medium px-3 py-1 rounded-full ${iotStatus.status === 'Standby' ? 'bg-secondary text-muted-foreground' : 'bg-destructive/20 text-destructive animate-pulse shadow-[0_0_10px_hsl(var(--destructive)/0.3)]'}`}>
              {iotStatus.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* LED */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${iotStatus.led ? 'border-primary bg-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.2)]' : 'border-border/50 bg-secondary/10'}`}>
              <p className="text-center text-lg font-display text-foreground">💡 Notification LED</p>
              <p className="text-center text-xs mt-1 text-muted-foreground">{iotStatus.led ? 'ACTIVE' : 'OFF'}</p>
            </div>
            {/* Buzzer */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${iotStatus.buzzer ? 'border-destructive bg-destructive/20 shadow-[0_0_15px_hsl(var(--destructive)/0.2)]' : 'border-border/50 bg-secondary/10'}`}>
              <p className="text-center text-lg font-display text-foreground">🔊 Buzzer Alarm</p>
              <p className="text-center text-xs mt-1 text-muted-foreground">{iotStatus.buzzer ? 'ACTIVE' : 'OFF'}</p>
            </div>
            {/* Motor */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${iotStatus.motor ? 'border-sunlight bg-sunlight/20 shadow-[0_0_15px_hsl(var(--sunlight)/0.2)]' : 'border-border/50 bg-secondary/10'}`}>
              <p className="text-center text-lg font-display text-foreground">⚙️ Pump / Motor</p>
              <p className="text-center text-xs mt-1 text-muted-foreground">{iotStatus.motor ? 'SPRAYING' : 'OFF'}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <motion.div
            className="glass-card rounded-2xl p-6 lg:col-span-2 bg-background/20 backdrop-blur-xl border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl tracking-tight">Detection Confidence Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(120 50% 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(120 50% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 12% 20%)" />
                <XAxis dataKey="day" stroke="hsl(140 8% 55%)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(140 8% 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 12% 20%)", borderRadius: 8, color: "hsl(45 30% 90%)" }} />
                <Area type="monotone" dataKey="health" stroke="hsl(120 50% 45%)" fill="url(#healthGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Alerts */}
          <motion.div
            className="glass-card rounded-2xl p-6 bg-background/20 backdrop-blur-xl border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-wheat" />
              <h3 className="font-display text-lg">Live Alerts</h3>
            </div>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts yet. Detections with high severity will appear here.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="flex gap-3 items-start">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ background: alertColors[a.severity || "medium"] }}
                    />
                    <div>
                      <p className="text-sm text-foreground/90">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pest Frequency */}
          <motion.div
            className="glass-card rounded-2xl p-6 bg-background/20 backdrop-blur-xl border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-4 h-4 text-destructive" />
              <h3 className="font-display text-lg">Pest Frequency by Day</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 12% 20%)" />
                <XAxis dataKey="day" stroke="hsl(140 8% 55%)" fontSize={12} />
                <YAxis stroke="hsl(140 8% 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(140 15% 12%)", border: "1px solid hsl(140 12% 20%)", borderRadius: 8, color: "hsl(45 30% 90%)" }} />
                <Bar dataKey="pests" fill="hsl(0 70% 50% / 0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Detections */}
          <motion.div
            className="glass-card rounded-2xl p-6 bg-background/20 backdrop-blur-xl border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg">Recent Detections</h3>
            </div>
            {detections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No detections yet.</p>
            ) : (
              <div className="space-y-3">
                {detections.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {d.disease_name && d.disease_name !== "None" ? d.disease_name : d.pest_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-primary">{d.confidence}%</span>
                      <p className="text-xs text-muted-foreground">{d.severity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
    </div>
  );
};

export default Dashboard;
