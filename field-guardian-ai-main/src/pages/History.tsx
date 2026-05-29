import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Calendar, Bug, Filter, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Detection {
  id: string;
  pest_name: string | null;
  disease_name: string | null;
  confidence: number | null;
  severity: string | null;
  suggested_action: string | null;
  image_url: string | null;
  created_at: string;
}

const History = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchDetections();

    // Realtime subscription
    const channel = supabase
      .channel("detections-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "detections" }, (payload) => {
        setDetections((prev) => [payload.new as Detection, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDetections = async () => {
    const { data, error } = await supabase
      .from("detections")
      .select("id, pest_name, disease_name, confidence, severity, suggested_action, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) setDetections(data);
    setLoading(false);
  };

  const filtered = severityFilter
    ? detections.filter((d) => d.severity === severityFilter)
    : detections;

  const severityColors: Record<string, string> = {
    low: "bg-glow-green/20 text-glow-green",
    medium: "bg-wheat/20 text-wheat",
    high: "bg-orange-400/20 text-orange-400",
    critical: "bg-destructive/20 text-destructive",
  };

  return (
    <main className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl mb-2">
            Detection <span className="text-gradient">History</span>
          </h1>
          <p className="text-muted-foreground">All past AI detections and results.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex gap-2 mb-6 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant={severityFilter === null ? "default" : "outline"}
            size="sm"
            className={severityFilter === null ? "bg-primary text-primary-foreground" : "border-border"}
            onClick={() => setSeverityFilter(null)}
          >
            <Filter className="w-3 h-3 mr-1" />
            All
          </Button>
          {["low", "medium", "high", "critical"].map((s) => (
            <Button
              key={s}
              variant={severityFilter === s ? "default" : "outline"}
              size="sm"
              className={severityFilter === s ? "bg-primary text-primary-foreground" : "border-border"}
              onClick={() => setSeverityFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading detections...</div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="glass-card rounded-2xl p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No detections yet. Go to the Detect page to analyze your crops!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((det, i) => (
              <motion.div
                key={det.id}
                className="glass-card rounded-xl p-5 flex flex-col sm:flex-row items-start gap-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Photo Thumbnail */}
                {det.image_url ? (
                  <div className="shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden border border-border/50 bg-black/40">
                    <img 
                      src={det.image_url} 
                      alt={det.pest_name || "Detection"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                    {det.severity === "high" || det.severity === "critical" ? (
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    ) : (
                      <Bug className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-medium text-lg text-foreground">
                      {det.disease_name && det.disease_name !== "None" ? det.disease_name : det.pest_name || "Unknown"}
                    </p>
                    {det.severity && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[det.severity] || ""}`}>
                        {det.severity}
                      </span>
                    )}
                    {det.confidence && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {det.confidence}% Match
                      </span>
                    )}
                  </div>
                  
                  {/* Rich Text Notes & Prescriptions */}
                  {det.suggested_action && (
                    <div className="text-sm text-muted-foreground mt-2 mb-3 bg-black/20 p-3.5 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                      {det.suggested_action}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-auto pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(det.created_at).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default History;
