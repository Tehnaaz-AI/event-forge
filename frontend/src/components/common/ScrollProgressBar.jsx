import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.0001
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[3.5px] z-[9999] pointer-events-none bg-[#EFE8DA]/40 dark:bg-stone-900/50 backdrop-blur-xs">
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="w-full h-full bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#F59E0B] shadow-[0_0_12px_rgba(217,119,6,0.7)]"
      />
    </div>
  );
}

