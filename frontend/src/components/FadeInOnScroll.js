import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// This component wraps any content you give it (its "children")
// and applies a fade-in animation when it scrolls into view.
const FadeInOnScroll = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // The animation will only happen once
    threshold: 0.1,    // The animation starts when 10% of the element is visible
  });

  const variants = {
    hidden: { opacity: 0, y: 50 }, // Start hidden, slightly below
    visible: { opacity: 1, y: 0 },   // Animate to visible, at its original position
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'} // Animate when 'inView' is true
      variants={variants}
      transition={{ duration: 0.8, ease: 'easeOut' }} // Smooth animation
    >
      {children}
    </motion.div>
  );
};

export default FadeInOnScroll;
