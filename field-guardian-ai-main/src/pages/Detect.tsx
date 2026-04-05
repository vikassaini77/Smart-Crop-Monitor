import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Loader2, AlertTriangle, CheckCircle, Bug, Leaf, Zap, X, Radio, Square, FileVideo, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { API_BASE_URL, getHeaders, fetchJobStatus, fetchJobResults, fetchPestInsights } from "@/lib/api";

interface DetectionResult {
  pest_name: string;
  disease_name?: string;
  confidence: number;
  severity: string;
  suggested_action?: string;
  description?: string;
  file_name?: string;
  frame_timestamp?: number;
}

const Detect = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Job Tracking
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("");
  const [results, setResults] = useState<DetectionResult[] | null>(null);

  // AI Insights Modal State
  const [selectedPest, setSelectedPest] = useState<DetectionResult | null>(null);
  const [pestInsights, setPestInsights] = useState<any | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Live Stream
  const [isBackendCameraActive, setIsBackendCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
    
    if (validFiles.length === 0) {
      toast.error("Please upload valid images or video files");
      return;
    }

    if (validFiles.some(f => f.type.startsWith("video/")) && validFiles.length > 1) {
      toast.error("Please upload only one video at a time, or multiple images.");
      return;
    }

    setSelectedFiles(validFiles);
    
    // Generate previews for images safely
    const newPreviews: string[] = [];
    validFiles.forEach(f => {
      if (f.type.startsWith("image/")) {
        const url = URL.createObjectURL(f);
        newPreviews.push(url);
      }
    });
    setPreviews(newPreviews);
    setResults(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handlePestClick = async (res: DetectionResult) => {
    if (res.pest_name === "None") return;
    setSelectedPest(res);
    setPestInsights(null);
    setIsLoadingInsights(true);
    try {
      // Calculate count (dummy for now, but could be aggregated)
      const count = results ? results.filter(r => r.pest_name === res.pest_name).length : 1;
      const data = await fetchPestInsights(res.pest_name, res.confidence / 100, count);
      setPestInsights(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch AI Insights");
      setSelectedPest(null);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const removeFileSelection = () => {
    previews.forEach(p => URL.revokeObjectURL(p));
    setSelectedFiles([]);
    setPreviews([]);
    setResults(null);
    setActiveJobId(null);
    setJobStatus("");
  };

  const submitBatchJob = async () => {
    if (selectedFiles.length === 0) return;
    setIsAnalyzing(true);
    setJobStatus("uploading");
    
    try {
      const isVideo = selectedFiles[0].type.startsWith("video/");
      const endpoint = isVideo ? "/upload-video" : "/upload-batch";
      
      const formData = new FormData();
      if (isVideo) {
        formData.append("file", selectedFiles[0], selectedFiles[0].name);
      } else {
        selectedFiles.forEach(f => formData.append("files", f, f.name));
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: formData,
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Upload failed");
      }
      
      const data = await response.json();
      setActiveJobId(data.job_id);
      setJobStatus("pending");
      toast.success(data.message);
    } catch (e: any) {
      toast.error(e.message || "Could not queue job");
      setIsAnalyzing(false);
    }
  };

  // Job Polling Effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (activeJobId && isAnalyzing) {
      intervalId = setInterval(async () => {
        try {
          const statusData = await fetchJobStatus(activeJobId);
          setJobStatus(statusData.status);

          if (statusData.status === "completed") {
            clearInterval(intervalId);
            const resultsData = await fetchJobResults(activeJobId);
            setResults(resultsData.data);
            setIsAnalyzing(false);
            setActiveJobId(null);
            toast.success("Analysis complete!");
            
            // Log highest severity event to Supabase dynamically
            if (resultsData.data.length > 0) {
                const worst = resultsData.data.reduce((prev: any, current: any) => 
                     (prev.severity === 'critical' || current.severity === 'low') ? prev : current
                );
                if (worst.severity === "high" || worst.severity === "critical") {
                  await supabase.from("alerts").insert({
                    title: `BATCH ALERT: ${worst.pest_name}`,
                    message: "High severity pest detected in recent scan batch.",
                    severity: worst.severity,
                  });
                }
            }
          } else if (statusData.status === "failed") {
            clearInterval(intervalId);
            setIsAnalyzing(false);
            setActiveJobId(null);
            toast.error("Cloud processing failed. Try again.");
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeJobId, isAnalyzing]);

  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p));
    };
  }, [previews]);

  const severityColors: Record<string, string> = {
    low: "text-glow-green",
    medium: "text-wheat",
    high: "text-orange-400",
    critical: "text-destructive",
  };

  const severityBg: Record<string, string> = {
    low: "bg-glow-green/10 border-glow-green/20",
    medium: "bg-wheat/10 border-wheat/20",
    high: "bg-orange-400/10 border-orange-400/20",
    critical: "bg-destructive/10 border-destructive/20",
  };

  return (
    <main className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div className="mb-8 flex items-start justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">
              Scalable <span className="text-gradient">Detection</span>
            </h1>
            <p className="text-muted-foreground">Upload batches of images or heavy video files for asynchronous AI routing.</p>
          </div>
        </motion.div>

        {/* 🔴 BACKEND LIVE STREAM */}
        <motion.div
          className="mb-6 glass-card rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isBackendCameraActive ? 'animate-pulse text-red-500' : 'text-muted-foreground'}`} />
              Live Edge Detection (Local)
            </h2>
            <Button 
              variant={isBackendCameraActive ? "destructive" : "default"} 
              onClick={() => setIsBackendCameraActive(!isBackendCameraActive)}
              size="sm"
            >
              {isBackendCameraActive ? <Square className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
              {isBackendCameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
          </div>

          <div className="bg-black rounded-xl overflow-hidden relative flex items-center justify-center" style={{ minHeight: "400px" }}>
            {isBackendCameraActive ? (
              <img
                src={`${API_BASE_URL}/video`}
                alt="YOLO Live Stream"
                className="w-full"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50">
                <Camera className="w-16 h-16 mb-4 opacity-30" />
                <p className="font-medium text-lg">Camera is Paused</p>
                <p className="text-sm mt-1">Click "Start Camera" to view live feed</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div
                className="glass-card rounded-2xl p-8 border-2 border-dashed border-border/50 hover:border-primary/30 transition-colors cursor-pointer min-h-[320px] flex flex-col items-center justify-center"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => selectedFiles.length === 0 && fileInputRef.current?.click()}
              >
                {selectedFiles.length > 0 ? (
                  <div className="w-full relative flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFileSelection();
                      }}
                      disabled={isAnalyzing}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    {selectedFiles.length === 1 && selectedFiles[0].type.startsWith("video/") ? (
                        <div className="flex flex-col items-center justify-center p-6 w-full text-center bg-secondary/20 rounded-xl mb-4">
                            <FileVideo className="w-12 h-12 text-primary mb-2" />
                            <p className="font-semibold text-foreground">Video Ready</p>
                            <p className="text-sm text-muted-foreground">{selectedFiles[0].name}</p>
                        </div>
                    ) : previews.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-center mb-4 max-h-48 overflow-y-auto w-full">
                        {previews.map((src, idx) => (
                           <img key={idx} src={src} className="h-16 w-16 object-cover rounded-md border" alt={`preview ${idx}`}/>
                        ))}
                      </div>
                    ) : (
                        <div className="flex flex-col items-center p-6 bg-secondary/20 rounded-xl mb-4">
                             <Files className="w-12 h-12 text-primary mb-2" />
                             <p className="font-medium">{selectedFiles.length} files selected</p>
                        </div>
                    )}
                    
                    <Button
                      className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={(e) => { e.stopPropagation(); submitBatchJob(); }}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing Queue...</>
                      ) : (
                        <><Zap className="w-4 h-4 mr-2" />Run Batch Inference</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-foreground font-medium mb-1">Drop images or a video here</p>
                    <p className="text-sm text-muted-foreground mb-4">Capable of processing up to 1000 images!</p>
                    <Button variant="outline" className="border-border" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      <Upload className="w-4 h-4 mr-2" />Select Files
                    </Button>
                  </>
                )}
              </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/mp4,video/avi,video/quicktime" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </motion.div>

          {/* Result Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div key="loading" className="glass-card rounded-2xl p-8 min-h-[320px] flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <Leaf className="w-6 h-6 text-glow-green absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-foreground mt-4 font-display text-lg">Cloud Processing</p>
                  <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wider">{jobStatus}</p>
                  <p className="text-xs text-muted-foreground mt-4 max-w-xs text-center">Batch jobs may take a few moments depending on queue length and file sizes.</p>
                </motion.div>
              ) : results ? (
                <motion.div key="result" className="glass-card rounded-2xl p-6 min-h-[320px] max-h-[500px] overflow-y-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-display text-lg font-semibold">Inference Results</h3>
                     <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">{results.length} Valid Detections</span>
                  </div>
                  
                  {results.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 bg-glow-green/5 rounded-xl border border-glow-green/20">
                          <CheckCircle className="w-12 h-12 text-glow-green mb-3" />
                          <p className="text-lg font-medium text-foreground">Clean Sweep!</p>
                          <p className="text-sm text-muted-foreground mt-1">No pests or diseases were detected in any of the files provided.</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                        {results.map((res, i) => {
                             const isHealthy = res.pest_name === "None";
                             const nameDisplay = isHealthy ? "Healthy Region" : res.pest_name;
                                return (
                            <div key={i} 
                                 onClick={() => handlePestClick(res)}
                                 className={`p-3 rounded-xl border transition-all ${isHealthy ? "bg-glow-green/10 border-glow-green/20" : "cursor-pointer hover:shadow-lg " + (severityBg[res.severity] || severityBg.medium)}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        {!isHealthy && <Bug className="w-4 h-4 text-destructive" />}
                                        <p className="font-semibold text-sm">{nameDisplay.toUpperCase()}</p>
                                    </div>
                                    <p className={`text-xs font-bold ${severityColors[res.severity]}`}>{res.severity.toUpperCase()}</p>
                                </div>
                                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                    <span>{res.file_name ? res.file_name : `Video at sec ${res.frame_timestamp?.toFixed(2)}`}</span>
                                    <span>Conf: {res.confidence.toFixed(1)}%</span>
                                </div>
                            </div>
                        )})}
                      </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" className="glass-card rounded-2xl p-8 min-h-[320px] flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Leaf className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-center">Batch results will be displayed here securely.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

        {/* AI Insights Modal */}
        <AnimatePresence>
          {selectedPest && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div 
                className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-primary/20 shadow-2xl"
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              >
                <div className="sticky top-0 right-0 p-4 flex justify-between items-center bg-background/90 backdrop-blur-md border-b z-10">
                    <h2 className="font-display text-2xl flex items-center gap-2">
                        <Bug className="w-6 h-6 text-primary" />
                        AI Agent Insights
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPest(null)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6">
                  {isLoadingInsights ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                      <p className="font-medium text-lg">Consulting Agronomy Agent...</p>
                      <p className="text-sm text-muted-foreground w-64 text-center mt-2">Generating comprehensive analysis for {selectedPest.pest_name.toUpperCase()}</p>
                    </div>
                  ) : pestInsights ? (
                    <div className="space-y-6">
                       <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-3xl font-display text-gradient mb-1">{pestInsights.pest_name}</h3>
                                <p className="text-muted-foreground italic">{pestInsights.scientific_name}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${severityBg[pestInsights.danger_level.toLowerCase()] || 'bg-secondary'}`}>
                                    {pestInsights.danger_level.toUpperCase()} RISK
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">Severity: {pestInsights.severity_score}/10</p>
                            </div>
                       </div>

                       <div className="bg-secondary/30 p-4 rounded-xl">
                           <p className="text-foreground leading-relaxed">{pestInsights.description}</p>
                       </div>

                       <div className="grid md:grid-cols-2 gap-4">
                           <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl">
                               <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Immediate Actions</h4>
                               <ul className="list-disc pl-5 text-sm space-y-1">
                                   {pestInsights.immediate_actions.map((act: string, idx: number) => <li key={idx} className="text-foreground/90">{act}</li>)}
                               </ul>
                           </div>
                           <div className="border border-glow-green/20 bg-glow-green/5 p-4 rounded-xl">
                               <h4 className="font-semibold text-glow-green mb-2 flex items-center gap-2"><Leaf className="w-4 h-4"/> Organic Treatment</h4>
                               <ul className="list-disc pl-5 text-sm space-y-1">
                                   {pestInsights.treatment_organic.map((act: string, idx: number) => <li key={idx} className="text-foreground/90">{act}</li>)}
                               </ul>
                           </div>
                       </div>

                       <div>
                           <h4 className="font-semibold text-foreground border-b pb-2 mb-3">Visible Symptoms & Impact</h4>
                           <ul className="list-disc pl-5 text-sm space-y-1 mb-4 text-muted-foreground">
                               {pestInsights.symptoms.map((sym: string, idx: number) => <li key={idx}>{sym}</li>)}
                           </ul>
                           <p className="text-sm bg-orange-400/10 border border-orange-400/20 p-3 rounded-lg text-orange-200">
                             <strong>Impact:</strong> {pestInsights.impact}
                           </p>
                       </div>
                       
                       <div className="bg-muted p-4 rounded-xl flex items-start gap-4">
                            <span className="text-3xl">🇮🇳</span>
                            <div>
                                <p className="font-medium text-sm text-muted-foreground mb-1">किसान सहायक (Hindi Tip)</p>
                                <p className="text-sm">{pestInsights.multilingual_tip}</p>
                            </div>
                       </div>
                    </div>
                  ) : (
                    <p className="text-center text-red-500">Failed to load insights.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </main>
  );
};

export default Detect;
