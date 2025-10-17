import React, { useEffect, useRef } from "react";
import { Container, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import '../styles/Hero.css';

function Hero() {
  const titleText = "Intelligent Pest Detection for Modern Farming";
  const titleWords = titleText.split(" ");

  const wordVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="Hero-section">
      {/* Glowing particle background */}
      <div className="hero-particles">
        {[...Array(25)].map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></span>
        ))}
      </div>

      <Container className="Hero-content">
        <motion.h1
          className="Hero-title"
          initial="hidden"
          animate="visible"
        >
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              className="word"
              variants={wordVariants}
              custom={i}
            >
              {word}{" "}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="Hero-subtitle animate-child"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
        >
          Upload images or videos to detect threats instantly.
        </motion.p>

        <motion.div
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34,255,110,0.6)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="success" size="lg" href="/dashboard">
            Try Detector
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}

export default Hero;
