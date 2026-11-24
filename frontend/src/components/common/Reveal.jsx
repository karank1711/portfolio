import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion.js';

/**
 * Scroll-reveal using CSS transforms only (no framer-motion on the critical path).
 */
export function Reveal({ children, className = '', delay = 0 }) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef(null);
  const [visible, setVisible] = useState(Boolean(reduce));

  useEffect(() => {
    if (visible || reduce || !ref.current) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduce, visible]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
