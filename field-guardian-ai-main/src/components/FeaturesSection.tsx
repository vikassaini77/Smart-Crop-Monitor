import { motion } from "framer-motion";
import { Bug, CloudSun, HeartPulse, BarChart3, Bot } from "lucide-react";

const features = [
  {
    icon: Bug,
    title: "Pest Detection",
    description: "AI-powered vision identifies pests and diseases in real-time with 98% accuracy.",
    color: "hsl(0 70% 50%)",
  },
  {
    icon: CloudSun,
    title: "Weather Intelligence",
    description: "7-day forecasts with smart alerts for rain, heat, and humidity risks.",
    color: "hsl(200 70% 55%)",
  },
  {
    icon: HeartPulse,
    title: "Crop Health Monitoring",
    description: "Continuous health tracking with early warning systems for crop stress.",
    color: "hsl(120 50% 45%)",
  },
  {
    icon: BarChart3,
    title: "Yield Analytics",
    description: "Predictive analytics to forecast yields and optimize farming decisions.",
    color: "hsl(45 80% 55%)",
  },
  {
    icon: Bot,
    title: "AI Farming Assistant",
    description: "Ask questions about pests, treatments, fertilizers, and get instant expert advice.",
    color: "hsl(280 50% 55%)",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Everything You Need to <span className="text-gradient">Protect Your Farm</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful AI tools designed for real farmers, not tech experts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card rounded-2xl p-6 group hover:border-primary/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${feature.color}20` }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <h3 className="font-display text-xl mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
