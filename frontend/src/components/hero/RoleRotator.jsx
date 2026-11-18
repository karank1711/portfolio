import { Typewriter } from '@/components/common/Typewriter.jsx';

export function RoleRotator({ roles = [], className = '' }) {
  const items = roles.filter(Boolean);
  if (!items.length) return null;

  return (
    <p
      className={`mt-1.5 sm:mt-4 min-h-[1.3em] font-serif text-base min-[360px]:text-lg min-[480px]:text-xl sm:text-2xl md:text-3xl italic text-accent ${className}`}
      aria-live="polite"
    >
      <Typewriter
        words={items}
        typingSpeed={80}
        deletingSpeed={45}
        pauseDuration={1800}
        delayBetweenWords={350}
        loop={true}
        cursor={true}
        cursorChar="|"
      />
    </p>
  );
}
