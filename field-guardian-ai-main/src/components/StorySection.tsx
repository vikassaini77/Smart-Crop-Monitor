import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    emoji: "🌱",
    title: "The Unseen Threat",
    text: "Generations of hard work can be devastated by pests and diseases that strike silently.",
  },
  {
    emoji: "👁️",
    title: "A New Vision",
    text: "Turn your phone or edge cameras into a vigilant eye. Capture the invisible details hiding in your fields.",
  },
  {
    emoji: "🧠",
    title: "Agronomy Intelligence",
    text: "Our AI acts as an expert companion, instantly identifying threats before they spread.",
  },
  {
    emoji: "🛡️",
    title: "Preserving the Harvest",
    text: "Receive precise, actionable guidance. Protect your crops, your livelihood, and your legacy.",
  },
];

const StorySection = () => {
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
          <h2 className="font-display text-4xl md:text-5xl mb-4 tracking-tight">
            From <span className="text-gradient">Problem to Protection</span>
          </h2>
          <p className="text-muted-foreground text-lg tracking-wide uppercase text-sm font-medium mt-6">How Smart Crop Monitor works for you.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="flex items-start gap-6 relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Timeline line */}
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-16 w-px h-16 bg-border" />
              )}

              <motion.div 
                className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-2xl shrink-0 z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {step.emoji}
              </motion.div>

              <div className="pb-16 pt-3">
                <h3 className="font-display text-xl text-foreground mb-2 tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">{step.text}</p>
              </div>

              {i < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-primary/40 absolute left-[22px] top-[60px] rotate-90" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorySection;
