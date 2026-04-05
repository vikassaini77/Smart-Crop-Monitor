import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Bug, Leaf, CloudRain, Eye, ExternalLink, MapPin, ArrowRight, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";

/* ─── Animated counter ─── */
const AnimatedCounter = ({ end, suffix = "", prefix = "", decimals = 0, duration = 2 }: {
  end: number; suffix?: string; prefix?: string; decimals?: number; duration?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration, decimals]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* ─── Real FAO / research-backed data ─── */
const stats = [
  { value: 40, suffix: "%", label: "Global crops lost to pests & diseases annually", source: "FAO, 2021" },
  { value: 220, suffix: "B", prefix: "$", label: "Economic losses from plant pests each year", source: "FAO ISPM" },
  { value: 38, suffix: "%", label: "Crop damage caused by insect pests alone in some regions", source: "Science, 2019" },
  { value: 828, suffix: "M", label: "People facing food insecurity globally", source: "UN FAO, 2023" },
];

/* ─── Chart data ─── */
const cropLossDistribution = [
  { name: "Insect Pests", value: 38, fill: "hsl(var(--chart-3))" },
  { name: "Plant Diseases", value: 28, fill: "hsl(var(--chart-2))" },
  { name: "Weeds", value: 24, fill: "hsl(var(--chart-4))" },
  { name: "Climate/Other", value: 10, fill: "hsl(var(--chart-5))" },
];

const economicImpactData = [
  { year: "2018", loss: 180 },
  { year: "2019", loss: 195 },
  { year: "2020", loss: 210 },
  { year: "2021", loss: 220 },
  { year: "2022", loss: 235 },
  { year: "2023", loss: 248 },
  { year: "2024", loss: 260 },
];

const cropLossTrend = [
  { year: "2000", pests: 26, diseases: 14, climate: 5 },
  { year: "2005", pests: 28, diseases: 16, climate: 6 },
  { year: "2010", pests: 30, diseases: 18, climate: 8 },
  { year: "2015", pests: 33, diseases: 20, climate: 10 },
  { year: "2020", pests: 36, diseases: 23, climate: 13 },
  { year: "2024", pests: 38, diseases: 25, climate: 15 },
];

const problems = [
  { icon: Bug, title: "Pest Attacks", desc: "Insects and parasites silently devour crops. FAO estimates insect pests alone cause up to 38% of crop losses in tropical regions, often undetected until it's too late.", color: "text-destructive" },
  { icon: Leaf, title: "Crop Diseases", desc: "Fungal, bacterial, and viral diseases spread rapidly. Wheat rust, rice blast, and citrus greening have devastated millions of hectares worldwide.", color: "text-wheat" },
  { icon: CloudRain, title: "Climate Change", desc: "Rising temperatures expand pest ranges into new regions. Droughts and floods create compounding stress that weakens crops and amplifies vulnerability.", color: "text-accent" },
  { icon: Eye, title: "No Early Detection", desc: "Most farmers rely on visual inspection. By the time symptoms are visible, 20-40% of yield is already lost. AI-powered monitoring can catch threats days earlier.", color: "text-primary" },
];

const resources = [
  { title: "FAO: Plant Pests Destroy Up to 40% of Crops", desc: "Official UN report on global crop losses due to plant pests — the basis for International Year of Plant Health.", url: "https://www.fao.org/news/story/en/item/1402920/icode/", tag: "FAO" },
  { title: "Science: Global Crop Loss to Pests", desc: "Peer-reviewed research quantifying 20–40% crop losses to pests, with regional breakdowns and projections.", url: "https://www.science.org/doi/10.1126/science.aaq1692", tag: "Research" },
  { title: "Nature: Climate & Agricultural Pest Risk", desc: "Study on how climate change amplifies pest pressure, expanding insect ranges and disease transmission.", url: "https://www.nature.com/articles/s41558-021-01000-1", tag: "Nature" },
  { title: "World Bank: Food Security Overview", desc: "Economic analysis of food insecurity and agricultural losses — impact on global poverty and development.", url: "https://www.worldbank.org/en/topic/food-security", tag: "World Bank" },
  { title: "IPPC: International Plant Protection", desc: "Global standards for plant health surveillance, phytosanitary measures, and early warning systems.", url: "https://www.ippc.int/", tag: "IPPC" },
  { title: "CABI: Crop Protection Compendium", desc: "Comprehensive database of pests, diseases, and invasive species threatening agriculture worldwide.", url: "https://www.cabi.org/cpc/", tag: "CABI" },
];

const regions = [
  { name: "South Asia", loss: 35, risk: "High", crops: "Rice, Wheat, Cotton", pests: "Bollworm, Brown Planthopper", economic: "$42B", population: "1.9B" },
  { name: "Sub-Saharan Africa", loss: 42, risk: "Critical", crops: "Maize, Cassava, Sorghum", pests: "Fall Armyworm, Locust", economic: "$18B", population: "1.2B" },
  { name: "Southeast Asia", loss: 30, risk: "High", crops: "Rice, Palm Oil, Rubber", pests: "Rice Stem Borer, Thrips", economic: "$28B", population: "690M" },
  { name: "Latin America", loss: 28, risk: "Medium", crops: "Soybean, Coffee, Sugarcane", pests: "Coffee Berry Borer, Whitefly", economic: "$35B", population: "660M" },
  { name: "East Africa", loss: 38, risk: "Critical", crops: "Tea, Flowers, Maize", pests: "Desert Locust, Tuta Absoluta", economic: "$12B", population: "450M" },
  { name: "Central Asia", loss: 25, risk: "Medium", crops: "Wheat, Cotton, Fruits", pests: "Sunn Pest, Cotton Bollworm", economic: "$8B", population: "75M" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

/* ─── Custom chart tooltip ─── */
const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-sm border border-border/30">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.value}{typeof p.value === "number" && p.value < 100 ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

/* ─── Main Component ─── */
const Problem = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const selectedRegionData = useMemo(() => regions.find(r => r.name === selectedRegion) || null, [selectedRegion]);

  return (
    <main className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 75%, hsla(var(--destructive), 0.12) 0%, transparent 55%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 35%, hsla(0,0%,0%,0.55) 100%)" }} />

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsla(var(--wheat), ${0.1 + Math.random() * 0.15})`,
              }}
              animate={{ y: [0, -35 - Math.random() * 45, 0], x: [0, (Math.random() - 0.5) * 25, 0], opacity: [0.08, 0.35, 0.08] }}
              transition={{ duration: 6 + Math.random() * 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 4 }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <motion.div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8" {...fadeUp}>
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm text-muted-foreground">Based on FAO & peer-reviewed research data</span>
          </motion.div>

          <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-6" {...fadeUp} transition={{ delay: 0.1 }}>
            Up to <span className="text-gradient">40%</span> of global crops are lost every year
          </motion.h1>

          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8" {...fadeUp} transition={{ delay: 0.2 }}>
            Pests, diseases, and climate change destroy over <span className="text-primary font-medium">$220 billion</span> in food production annually.
            Behind every statistic is a family, a community, a future at risk.
          </motion.p>

          <motion.div className="flex items-center justify-center gap-4 flex-wrap" {...fadeUp} transition={{ delay: 0.3 }}>
            <a href="#charts" className="inline-block">
              <Button variant="outline" size="lg" className="gap-2 border-border/50 hover:border-primary/40">
                <Activity className="w-4 h-4" /> View the Data
              </Button>
            </a>
            <Link to="/detect">
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Start Monitoring <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-20 md:py-28 bg-card/40">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl md:text-4xl font-display text-center mb-4" {...fadeUp}>
            The Scale of the <span className="text-gradient">Crisis</span>
          </motion.h2>
          <motion.p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto" {...fadeUp}>
            Real numbers from international organizations and peer-reviewed studies
          </motion.p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} className="glass-card rounded-xl p-6 md:p-8 text-center group hover:border-primary/30 transition-colors" {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <p className="text-3xl md:text-5xl font-bold text-gradient mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  <AnimatedCounter end={s.value} suffix={s.suffix} prefix={s.prefix} />
                </p>
                <p className="text-sm text-muted-foreground mb-3">{s.label}</p>
                <span className="inline-block text-[10px] uppercase tracking-widest text-accent/70 bg-accent/10 px-2 py-0.5 rounded-full">
                  {s.source}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CHARTS ─── */}
      <section id="charts" className="py-20 md:py-28 scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl md:text-4xl font-display text-center mb-4" {...fadeUp}>
            Data <span className="text-gradient">Visualized</span>
          </motion.h2>
          <motion.p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto" {...fadeUp}>
            Interactive charts showing the growing threat to global food security
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Pie Chart — Crop Loss Distribution */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    Crop Loss by Cause
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={cropLossDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                        {cropLossDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bar Chart — Economic Impact */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Economic Losses ($ Billions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={economicImpactData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="loss" name="Loss ($B)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Area Chart — Trend over time (full width) */}
            <motion.div className="lg:col-span-2" {...fadeUp} transition={{ delay: 0.3 }}>
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Activity className="w-4 h-4 text-destructive" />
                    Growing Threat: Crop Loss Trend (% of Global Production)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cropLossTrend}>
                      <defs>
                        <linearGradient id="pestGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="diseaseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="climateGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="pests" name="Pest Losses" stroke="hsl(var(--chart-3))" fill="url(#pestGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="diseases" name="Disease Losses" stroke="hsl(var(--chart-2))" fill="url(#diseaseGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="climate" name="Climate Losses" stroke="hsl(var(--chart-5))" fill="url(#climateGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM BREAKDOWN ─── */}
      <section className="py-20 md:py-28 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl md:text-4xl font-display text-center mb-14" {...fadeUp}>
            What Farmers <span className="text-gradient">Face</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {problems.map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <Card className="glass-card border-border/30 h-full hover:border-primary/30 transition-colors duration-300">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-secondary ${p.color}`}>
                        <p.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground font-display">{p.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div className="text-center space-y-8" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-display">
              A Farmer's <span className="text-gradient">Story</span>
            </h2>
            <div className="space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed text-left md:text-center">
              <motion.p {...fadeUp} transition={{ delay: 0.1 }}>
                A farmer wakes before dawn. He walks through rows of crops he planted with his own hands — seeds bought with savings, nurtured through months of labor.
              </motion.p>
              <motion.p {...fadeUp} transition={{ delay: 0.2 }}>
                One morning, he notices a slight discoloration on a few leaves. He thinks it's nothing. A week later, the disease has spread to half the field.
              </motion.p>
              <motion.p {...fadeUp} transition={{ delay: 0.3 }}>
                By harvest time, <span className="text-destructive font-medium">40% of his crop is gone</span>. The income he needed to feed his family, pay for his children's education — reduced to nothing.
              </motion.p>

              {/* Visual crop damage progression */}
              <motion.div className="flex items-center justify-center gap-2 py-6" {...fadeUp} transition={{ delay: 0.35 }}>
                {["🌱", "🌿", "🍃", "🍂", "💀"].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="glass-card rounded-lg p-3 md:p-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.12 }}
                  >
                    <span className="text-2xl md:text-3xl">{emoji}</span>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">
                      {["Planted", "Growing", "Infected", "Damaged", "Lost"][i]}
                    </p>
                  </motion.div>
                ))}
                {/* Connecting arrows */}
              </motion.div>

              <motion.p className="text-foreground font-medium text-lg md:text-xl" {...fadeUp} transition={{ delay: 0.5 }}>
                This isn't a rare story. This happens to <span className="text-primary">millions</span> of farmers every year.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── REGIONAL IMPACT ─── */}
      <section className="py-20 md:py-28 bg-card/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2 className="text-3xl md:text-4xl font-display text-center mb-4" {...fadeUp}>
            Impact in <span className="text-gradient">Your Region</span>
          </motion.h2>
          <motion.p className="text-center text-muted-foreground mb-12" {...fadeUp}>
            Select a region to see estimated crop loss and risk data
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {regions.map((r, i) => (
              <motion.button
                key={r.name}
                className={`p-4 rounded-xl text-left transition-all duration-300 ${
                  selectedRegion === r.name
                    ? "bg-primary/15 border-2 border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
                    : "glass-card border border-border/20 hover:border-primary/20"
                }`}
                onClick={() => setSelectedRegion(selectedRegion === r.name ? null : r.name)}
                {...fadeUp}
                transition={{ delay: i * 0.06 }}
              >
                <MapPin className={`w-4 h-4 mb-2 ${selectedRegion === r.name ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.risk} Risk</p>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedRegionData && (
              <motion.div
                key={selectedRegionData.name}
                className="glass-card rounded-xl p-6 md:p-8 border border-primary/20"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-destructive">{selectedRegionData.loss}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Crop Loss</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xl md:text-2xl font-bold ${selectedRegionData.risk === "Critical" ? "text-destructive" : selectedRegionData.risk === "High" ? "text-warning" : "text-primary"}`}>
                      {selectedRegionData.risk}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Risk Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-primary">{selectedRegionData.economic}</p>
                    <p className="text-xs text-muted-foreground mt-1">Annual Losses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-foreground">{selectedRegionData.population}</p>
                    <p className="text-xs text-muted-foreground mt-1">Affected Population</p>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-border/30 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Primary Crops</p>
                    <p className="text-foreground">{selectedRegionData.crops}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Major Pest Threats</p>
                    <p className="text-foreground">{selectedRegionData.pests}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── RESOURCES ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2 className="text-3xl md:text-4xl font-display text-center mb-4" {...fadeUp}>
            Learn More About This <span className="text-gradient">Crisis</span>
          </motion.h2>
          <motion.p className="text-center text-muted-foreground mb-12" {...fadeUp}>
            Trusted sources and peer-reviewed research
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r, i) => (
              <motion.a
                key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                className="glass-card rounded-xl p-5 border border-border/20 hover:border-primary/30 transition-all duration-300 group block"
                {...fadeUp} transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">{r.tag}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 md:py-32 bg-card/20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div className="space-y-6" {...fadeUp}>
            <h2 className="text-3xl md:text-5xl font-display">
              But early detection can{" "}
              <span className="text-gradient">save crops</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our AI detects diseases and pest threats days before they become visible — giving farmers the power to act early.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-8">
                Start Monitoring <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Problem;
