import { useEffect, useRef, useState } from 'react';

function isVideoPath(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.includes('/videos/');
}

export function ProfileMedia({
  mediaType = 'image',
  mediaUrl,
  imageUrl,
  alt = '',
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);

  const isVideo = mediaType === 'video' && Boolean(mediaUrl) && !videoFailed;
  const activeImage = imageUrl || (!isVideoPath(mediaUrl) ? mediaUrl : '');

  useEffect(() => {
    setVideoFailed(false);
  }, [mediaUrl, mediaType]);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      const el = videoRef.current;
      el.muted = true;
      el.defaultMuted = true;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silent catch for browser autoplay restrictions
        });
      }
    }
  }, [isVideo, mediaUrl]);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[0.9rem] sm:rounded-[1.2rem] bg-surface">
      {isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={activeImage || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : activeImage ? (
        <img
          src={activeImage}
          alt={alt}
          crossOrigin="anonymous"
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
