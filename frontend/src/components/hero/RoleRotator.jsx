import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function RoleRotator({ roles = [] }) {
  const items = roles.filter(Boolean);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || items.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 2600);
    return () => clearInterval(timer);
  }, [items.length, reduce]);

  if (!items.length) return null;
  const current = items[index] || items[0];

  return (
    <p className="mt-4 min-h-[1.3em] font-serif text-2xl italic text-accent sm:text-3xl" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          className="inline-flex items-center"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          {current}
          <span className="ml-1 inline-block h-[0.85em] w-px bg-accent motion-safe:animate-pulse" aria-hidden />
        </motion.span>
      </AnimatePresence>
    </p>
  );
}
