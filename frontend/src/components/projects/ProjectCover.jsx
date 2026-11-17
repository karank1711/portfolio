export function ProjectCover({ src, alt, zoom = false }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-surface">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`block h-full w-full object-cover ${zoom ? 'origin-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100' : ''}`}
      />
    </div>
  );
}
