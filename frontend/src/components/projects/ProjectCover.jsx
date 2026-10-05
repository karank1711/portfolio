export function ProjectCover({ src, alt, zoom = false }) {
  return (
    <div className="overflow-hidden rounded-2xl">
      <img
        src={src}
        alt={alt}
        className={`block h-auto w-full ${zoom ? 'origin-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100' : ''}`}
      />
    </div>
  );
}
