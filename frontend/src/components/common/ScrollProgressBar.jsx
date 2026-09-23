import React from 'react';
import { motion, useScroll } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#C28E27] origin-left z-[100] shadow-sm pointer-events-none transition-none"
    />
  );
}
