"use client";

import { motion } from "motion/react";

/** Runs on every navigation within /community — gives each space an
 *  Apple-like fade + rise entrance (decelerating ease-out curve). */
export default function CommunityTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
