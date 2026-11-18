import { useEffect, useRef, useState } from 'react';

export function ProjectCover({ src, alt, zoom = false, priority = false }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface/60">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={1280}
        height={720}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`block h-full w-full object-cover transition-opacity duration-300 ${
          loaded || priority ? 'opacity-100' : 'opacity-0'
        } ${
          zoom
            ? 'origin-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100'
            : ''
        }`}
      />
    </div>
  );
}
