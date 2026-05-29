import { motion } from "framer-motion";

const EmotionalSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: "radial-gradient(ellipse at 30% 50%, hsl(80 40% 40% / 0.3), transparent 60%)",
        }}
      />
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <p className="font-display text-3xl md:text-5xl leading-snug max-w-3xl mx-auto text-foreground/90 tracking-tight">
            "Farming isn't just an occupation.
            <br />
            <span className="text-gradient">It's a legacy written in the soil.</span>"
          </p>
          <p className="text-muted-foreground mt-6 text-lg font-light tracking-wide">
            You protect what grows. We protect what you can't see.
          </p>
        </motion.div>

        {/* Growing plant animation */}
        <motion.div
          className="mt-16 flex justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-glow-green/40"
              initial={{ height: 0 }}
              whileInView={{ height: 30 + i * 15 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EmotionalSection;
