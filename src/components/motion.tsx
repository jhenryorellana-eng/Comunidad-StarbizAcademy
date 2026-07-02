"use client";

import { animate, motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

// Shared Apple-like easing (decelerate on enter).
export const EASE = [0.32, 0.72, 0, 1] as const;
export const SPRING = { type: "spring", stiffness: 360, damping: 36 } as const;

/** Fade + rise as it scrolls into view (once). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Same as Reveal but renders a <section>, so it can replace one cleanly. */
export function RevealSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Wrap a grid/list; children wrapped in <StaggerItem> appear one after another. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** Tactile press: scales down slightly when tapped/clicked. */
export function Pressable({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Counts from 0 to `value` when scrolled into view. */
export function CountUp({
  value,
  className,
  duration = 1.2,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Animated checkmark that draws itself in. */
export function SuccessCheck({ size = 56 }: { size?: number }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
      style={{ width: size, height: size }}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING}
    >
      <motion.svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
        />
      </motion.svg>
    </motion.span>
  );
}
