
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingTexts = [
  "Choosing the right club...",
  "Working on your yardage...",
  "Reading the green...",
  "Checking the wind...",
  "Perfecting the tempo...",
  "Lining up the putt...",
  "Visualising the shot...",
];

export const GolfLoadingAnimation = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 2500); // Change text every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-lg border border-primary">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentTextIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-foreground text-center h-5"
        >
          {loadingTexts[currentTextIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
