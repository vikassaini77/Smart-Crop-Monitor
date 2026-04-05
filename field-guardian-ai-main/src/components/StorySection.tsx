import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    emoji: "😟",
    title: "The Problem",
    text: "Farmers lose up to 40% of crops to undetected pests and diseases every year.",
  },
  {
    emoji: "📸",
    title: "Capture",
    text: "Simply take a photo of your crops or enable live monitoring with your camera.",
  },
  {
    emoji: "🧠",
    title: "AI Analysis",
    text: "Our AI instantly identifies threats, diseases, and health issues with precision.",
  },
  {
    emoji: "✅",
    title: "Action",
    text: "Get personalized treatment recommendations and protect your harvest.",
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
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            From <span className="text-gradient">Problem to Protection</span>
          </h2>
          <p className="text-muted-foreground text-lg">How Smart Crop Monitor works for you.</p>
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

              <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-2xl shrink-0">
                {step.emoji}
              </div>

              <div className="pb-12">
                <h3 className="font-display text-lg text-foreground mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.text}</p>
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
