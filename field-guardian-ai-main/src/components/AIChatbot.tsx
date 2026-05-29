import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, X, Send, Leaf, Mic, MicOff, Volume2, VolumeX, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL } from "@/lib/api";


interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${API_BASE_URL}/api/chat`;

const AnimatedSprout = ({ className = "" }: { className?: string }) => (
  <motion.svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ filter: "drop-shadow(0px 0px 8px rgba(74,222,128,0.8))" }}>
    {/* Stem growing */}
    <motion.path 
      d="M12 22V12" 
      initial={{ pathLength: 0 }}
      animate={{ pathLength: [0.2, 1, 0.2] }} 
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
    />
    {/* Left Leaf breathing */}
    <motion.path 
      d="M12 12C12 12 8 5 3 6C3 6 3 12 12 12Z" 
      fill="rgba(74,222,128,0.3)"
      animate={{ scale: [0.7, 1.1, 0.7], opacity: [0.4, 1, 0.4], rotate: [-10, 5, -10] }} 
      style={{ transformOrigin: "12px 12px" }}
      transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: "easeInOut" }} 
    />
    {/* Right Leaf breathing */}
    <motion.path 
      d="M12 12C12 12 16 4 21 5C21 5 21 12 12 12Z" 
      fill="rgba(74,222,128,0.3)"
      animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.4, 1, 0.4], rotate: [10, -5, 10] }} 
      style={{ transformOrigin: "12px 12px" }}
      transition={{ duration: 3, repeat: Infinity, delay: 1, ease: "easeInOut" }} 
    />
  </motion.svg>
);

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there! 🌱 I'm CropAI, your farming assistant. Ask me about pests, diseases, treatments, or tap the mic to speak!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Web Speech API - Speech Recognition
  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setInput("(Voice not supported in this browser)"); return; }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  // Web Speech API - Text to Speech
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*_`~>]/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
  }, []);

  const getDetectionContext = useCallback(async () => {
    const { data } = await supabase
      .from("detections")
      .select("pest_name, disease_name, confidence, severity, suggested_action, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data && data.length > 0) {
      return data.map((d: any) =>
        `- ${d.created_at}: ${d.pest_name || "N/A"} / ${d.disease_name || "N/A"} (${d.confidence}% confidence, ${d.severity} severity)`
      ).join("\n");
    }
    return null;
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const detectionContext = await getDetectionContext();
    const allMessages = [...messages.filter((_, i) => i !== 0), userMsg];
    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "smartcrop2026",
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          detectionContext,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Speak the final response
      if (assistantSoFar) speak(assistantSoFar);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting. Please try again. 🙏" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button - The "Seed" */}
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-colors border border-white/20 z-[60]"
        style={{
          background: "linear-gradient(135deg, hsl(122 55% 42%), hsl(128 55% 22%))",
          boxShadow: "0 0 25px hsla(122, 55%, 42%, 0.4), inset 0 2px 4px hsla(255, 255%, 255%, 0.3)",
        }}
        animate={{
          y: isOpen ? 0 : [0, -10, 0],
          rotate: isOpen ? 90 : 0,
        }}
        transition={{
          y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
          rotate: { duration: 0.3, ease: "backOut" }
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : <div className="w-8 h-8"><AnimatedSprout /></div>}
        
        {/* Subtle glowing aura */}
        {!isOpen && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        )}
      </motion.button>

      {/* Chat panel - The "Greenhouse" */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-28 right-6 w-[380px] max-w-[calc(100vw-3rem)] rounded-3xl flex flex-col z-[60] overflow-hidden"
            style={{
              height: 520, 
              maxHeight: "calc(100vh - 9rem)",
              background: "rgba(18, 25, 20, 0.65)", // Deep earthy glass
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(80, 200, 100, 0.15)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div 
              className="px-5 py-4 border-b border-white/5 flex items-center justify-between relative overflow-hidden"
              style={{ background: "linear-gradient(to right, rgba(20,40,25,0.8), rgba(15,30,20,0.8))" }}
            >
              {/* Decorative background leaf */}
              <Leaf className="absolute -right-4 -top-4 w-24 h-24 text-white/5 -rotate-45" />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400/10 to-emerald-600/10 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)] overflow-hidden p-2">
                  <AnimatedSprout />
                </div>
                <div>
                  <p className="font-display text-lg text-white tracking-wide">CropAI</p>
                  <p className="text-xs text-green-400 flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Listening & Growing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button onClick={stopSpeaking} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors" title="Stop Speaking">
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
                <button onClick={() => setTtsEnabled(!ttsEnabled)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title={ttsEnabled ? "Mute voice" : "Unmute voice"}>
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
              <Sprout className="w-64 h-64 text-green-500" />
            </div>
            <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-700/20 border border-green-500/30 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Leaf className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed shadow-lg ${
                        msg.role === "user" 
                          ? "bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl rounded-tr-sm border border-green-500/50" 
                          : "bg-black/40 text-gray-200 rounded-2xl rounded-tl-sm border border-white/10 backdrop-blur-md"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_ul]:m-0 [&_li]:m-0 [&_strong]:text-white">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-700/20 border border-green-500/30 flex items-center justify-center shrink-0 mt-1">
                      <Leaf className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="bg-black/40 px-5 py-2 rounded-2xl rounded-tl-sm border border-white/10 flex items-center justify-center h-[50px] w-[60px] shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                      {/* Organic growing plant animation instead of dots */}
                      <AnimatedSprout />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input - The "Soil" */}
            <div className="p-4 bg-black/50 border-t border-white/5 backdrop-blur-xl">
              {/* Waveform indicator */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex items-center justify-center gap-1.5 mb-3 overflow-hidden"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        className="w-1 bg-green-500 rounded-full" 
                        animate={{ height: [8, 24, 8] }} 
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }} 
                      />
                    ))}
                    <span className="text-xs text-green-400 ml-2 font-medium">Listening to nature...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="flex gap-2 items-end" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask about pests, crops, or treatments..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-colors resize-none overflow-hidden"
                    disabled={isLoading}
                    rows={1}
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading} 
                  className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
