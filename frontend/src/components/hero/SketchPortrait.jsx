import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const TOTAL = 3800;
const OUTLINE_END = 900;
const FEATURE_END = 2200;
const SHADE_END = 3000;
const PAPER = '#f3efe6';

function drawContained(ctx, image, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function boxBlur(source, width, height, radius) {
  const temp = new Float32Array(source.length);
  const output = new Float32Array(source.length);
  const span = radius * 2 + 1;
  for (let y = 0; y < height; y += 1) {
    let sum = 0;
    const row = y * width;
    for (let x = -radius; x <= radius; x += 1) sum += source[row + Math.min(width - 1, Math.max(0, x))];
    for (let x = 0; x < width; x += 1) {
      temp[row + x] = sum / span;
      sum -= source[row + Math.max(0, x - radius)];
      sum += source[row + Math.min(width - 1, x + radius + 1)];
    }
  }
  for (let x = 0; x < width; x += 1) {
    let sum = 0;
    for (let y = -radius; y <= radius; y += 1) sum += temp[Math.min(height - 1, Math.max(0, y)) * width + x];
    for (let y = 0; y < height; y += 1) {
      output[y * width + x] = sum / span;
      sum -= temp[Math.max(0, y - radius) * width + x];
      sum += temp[Math.min(height - 1, y + radius + 1) * width + x];
    }
  }
  return output;
}

function prepareSketch(image, width, height) {
  const photo = document.createElement('canvas');
  photo.width = width;
  photo.height = height;
  const photoCtx = photo.getContext('2d', { willReadFrequently: true });
  photoCtx.fillStyle = PAPER;
  photoCtx.fillRect(0, 0, width, height);
  photoCtx.imageSmoothingEnabled = true;
  drawContained(photoCtx, image, width, height);
  const pixels = photoCtx.getImageData(0, 0, width, height).data;
  const count = width * height;
  const gray = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const offset = i * 4;
    gray[i] = pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
  }

  const magnitude = new Float32Array(count);
  const direction = new Float32Array(count);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const gx = -gray[index - width - 1] + gray[index - width + 1] - 2 * gray[index - 1] + 2 * gray[index + 1] - gray[index + width - 1] + gray[index + width + 1];
      const gy = -gray[index - width - 1] - 2 * gray[index - width] - gray[index - width + 1] + gray[index + width - 1] + 2 * gray[index + width] + gray[index + width + 1];
      magnitude[index] = Math.hypot(gx, gy);
      direction[index] = Math.atan2(gy, gx);
    }
  }

  const blurred = boxBlur(gray.map((value) => 255 - value), width, height, Math.max(2, Math.round(Math.min(width, height) / 48)));
  const tone = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const dodge = Math.min(255, (gray[i] * 255) / (255 - blurred[i] + 1));
    tone[i] = Math.max(0, dodge - Math.min(90, magnitude[i] * 0.28));
  }

  const sample = [];
  for (let i = 0; i < count; i += 8) sample.push(magnitude[i]);
  sample.sort((a, b) => a - b);
  const outlineLevel = sample[Math.floor(sample.length * 0.9)] || 1;
  const detailLevel = sample[Math.floor(sample.length * 0.78)] || 1;

  const traced = traceStrokes(magnitude, direction, width, height, outlineLevel, detailLevel);
  const hatches = buildHatches(tone, magnitude, width, height, outlineLevel);
  const shade = shadeCanvas(tone, width, height);
  return { photo, hatches, shade, strokes: traced.strokes, outlineCount: traced.outlineCount };
}

function traceStrokes(magnitude, direction, width, height, outlineLevel, detailLevel) {
  const visited = new Uint8Array(width * height);
  const seeds = [];
  for (let y = 2; y < height - 2; y += 1) {
    for (let x = 2; x < width - 2; x += 1) {
      const index = y * width + x;
      if (magnitude[index] >= detailLevel) seeds.push(index);
    }
  }
  seeds.sort((a, b) => magnitude[b] - magnitude[a]);

  const strokes = [];
  const walk = (startX, startY, angle, maxLength, minLevel) => {
    const points = [];
    let x = startX;
    let y = startY;
    let heading = angle;
    for (let step = 0; step < maxLength; step += 1) {
      const index = y * width + x;
      if (visited[index] && step > 0) break;
      visited[index] = 1;
      const wobble = ((index * 17) % 5) - 2;
      points.push({ x: x + wobble * 0.18, y: y + (((index * 13) % 5) - 2) * 0.18 });
      let next = null;
      let best = -1;
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (!offsetX && !offsetY) continue;
          const nextX = x + offsetX;
          const nextY = y + offsetY;
          if (nextX < 1 || nextY < 1 || nextX >= width - 1 || nextY >= height - 1) continue;
          const nextIndex = nextY * width + nextX;
          if (visited[nextIndex] || magnitude[nextIndex] < minLevel) continue;
          let delta = Math.abs(Math.atan2(offsetY, offsetX) - heading);
          if (delta > Math.PI) delta = Math.PI * 2 - delta;
          const score = magnitude[nextIndex] * (1.2 - delta);
          if (score > best) {
            best = score;
            next = { x: nextX, y: nextY, angle: Math.atan2(offsetY, offsetX) };
          }
        }
      }
      if (!next) break;
      x = next.x;
      y = next.y;
      heading = next.angle;
    }
    return points;
  };

  for (const seed of seeds) {
    if (strokes.length > 820) break;
    if (visited[seed]) continue;
    const x = seed % width;
    const y = Math.floor(seed / width);
    const strong = magnitude[seed] >= outlineLevel;
    const tangent = direction[seed] + Math.PI / 2;
    const maxLength = strong ? 26 + (seed % 14) : 12 + (seed % 8);
    const minLevel = strong ? outlineLevel * 0.72 : detailLevel * 0.85;
    const forward = walk(x, y, tangent, maxLength, minLevel);
    const backward = walk(x, y, tangent + Math.PI, Math.round(maxLength * 0.65), minLevel);
    const points = [...backward.reverse(), ...forward];
    if (points.length < 5) continue;
    let sumX = 0;
    let sumY = 0;
    points.forEach((point) => {
      sumX += point.x;
      sumY += point.y;
    });
    strokes.push({
      points,
      strong,
      width: strong ? 1.15 : 0.72,
      cx: sumX / points.length,
      cy: sumY / points.length,
    });
  }

  if (!strokes.length) return { strokes, outlineCount: 0 };
  const centerX = strokes.reduce((sum, stroke) => sum + stroke.cx, 0) / strokes.length;
  const centerY = strokes.reduce((sum, stroke) => sum + stroke.cy, 0) / strokes.length;
  const distances = strokes.map((stroke) => Math.hypot(stroke.cx - centerX, stroke.cy - centerY)).sort((a, b) => a - b);
  const midDistance = distances[Math.floor(distances.length * 0.45)] || 1;
  const around = (stroke) => (Math.atan2(stroke.cy - centerY, stroke.cx - centerX) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const outlines = strokes.filter((stroke) => stroke.strong && Math.hypot(stroke.cx - centerX, stroke.cy - centerY) >= midDistance);
  const features = strokes.filter((stroke) => stroke.strong && Math.hypot(stroke.cx - centerX, stroke.cy - centerY) < midDistance);
  const details = strokes.filter((stroke) => !stroke.strong);
  outlines.sort((a, b) => around(a) - around(b));
  features.sort((a, b) => around(a) - around(b));
  details.sort((a, b) => Math.hypot(a.cx - centerX, a.cy - centerY) - Math.hypot(b.cx - centerX, b.cy - centerY));
  return {
    strokes: [...outlines, ...features, ...details],
    outlineCount: outlines.length,
  };
}

function buildHatches(tone, magnitude, width, height, outlineLevel) {
  const inf = 1e6;
  const distance = new Float32Array(width * height);
  distance.fill(inf);
  for (let i = 0; i < magnitude.length; i += 1) {
    if (magnitude[i] >= outlineLevel) distance[i] = 0;
  }
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      distance[index] = Math.min(distance[index], distance[index - 1] + 1, distance[index - width] + 1, distance[index - width - 1] + 1.4);
    }
  }
  for (let y = height - 2; y > 0; y -= 1) {
    for (let x = width - 2; x > 0; x -= 1) {
      const index = y * width + x;
      distance[index] = Math.min(distance[index], distance[index + 1] + 1, distance[index + width] + 1, distance[index + width + 1] + 1.4);
    }
  }

  const hatches = [];
  const step = Math.max(3, Math.round(Math.min(width, height) / 90));
  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const index = y * width + x;
      if (tone[index] > 206) continue;
      const depth = 1 - tone[index] / 206;
      if (((x * 13 + y * 7) % 7) / 7 > depth) continue;
      const length = 2.5 + depth * 6;
      const angle = -0.72 + ((x * 3 + y * 5) % 9) * 0.035;
      hatches.push({
        x,
        y,
        x2: x + Math.cos(angle) * length,
        y2: y + Math.sin(angle) * length,
        alpha: 0.35 + depth * 0.65,
        width: step * 1.35,
        distance: distance[index],
      });
    }
  }
  hatches.sort((a, b) => a.distance - b.distance);
  return hatches;
}

function shadeCanvas(tone, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(width, height);
  for (let i = 0; i < tone.length; i += 1) {
    const graphite = tone[i] / 255;
    const offset = i * 4;
    image.data[offset] = 28 + graphite * 214;
    image.data[offset + 1] = 25 + graphite * 212;
    image.data[offset + 2] = 20 + graphite * 206;
    image.data[offset + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function strokeLine(ctx, stroke, scale) {
  const { points } = stroke;
  ctx.beginPath();
  ctx.lineWidth = stroke.width * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke.strong ? 'rgba(46, 42, 36, 0.88)' : 'rgba(68, 62, 54, 0.62)';
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    for (let i = 1; i < points.length - 1; i += 1) {
      const next = points[i + 1];
      ctx.quadraticCurveTo(points[i].x, points[i].y, (points[i].x + next.x) / 2, (points[i].y + next.y) / 2);
    }
  }
  ctx.stroke();
}

function drawPencil(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(58, 52, 46, 0.9)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(11, -1.7);
  ctx.lineTo(11, 1.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function SketchPortrait({ src, alt }) {
  const reduce = useReducedMotion();
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setReady(false);
    setDone(false);
  }, [src]);

  useEffect(() => {
    const image = imgRef.current;
    if (image?.complete && image.naturalWidth) setReady(true);
  }, [src]);

  useLayoutEffect(() => {
    if (reduce || !ready || done) return undefined;
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return undefined;

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = width;
    canvas.height = height;

    let sketch;
    try {
      sketch = prepareSketch(image, width, height);
    } catch {
      setDone(true);
      return undefined;
    }

    const ink = document.createElement('canvas');
    ink.width = width;
    ink.height = height;
    const mask = document.createElement('canvas');
    mask.width = width;
    mask.height = height;
    const reveal = document.createElement('canvas');
    reveal.width = width;
    reveal.height = height;
    const inkCtx = ink.getContext('2d');
    const maskCtx = mask.getContext('2d');
    const revealCtx = reveal.getContext('2d');
    const ctx = canvas.getContext('2d');
    inkCtx.lineCap = 'round';

    let frame = 0;
    let active = true;
    let strokeCursor = 0;
    let hatchCursor = 0;
    const start = performance.now();
    const outlineCount = sketch.outlineCount;
    const featureCount = sketch.strokes.length;

    function tipFromStroke(stroke) {
      const points = stroke.points;
      const last = points[points.length - 1];
      const prev = points[Math.max(0, points.length - 3)];
      return { x: last.x, y: last.y, angle: Math.atan2(last.y - prev.y, last.x - prev.x) };
    }

    function paint(progress, tip) {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, width, height);
      if (progress > FEATURE_END) {
        revealCtx.clearRect(0, 0, width, height);
        revealCtx.globalCompositeOperation = 'source-over';
        revealCtx.drawImage(sketch.shade, 0, 0);
        revealCtx.globalCompositeOperation = 'destination-in';
        revealCtx.drawImage(mask, 0, 0);
        revealCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(reveal, 0, 0);
      }
      ctx.drawImage(ink, 0, 0);
      if (progress >= SHADE_END) {
        const blend = Math.min(1, (progress - SHADE_END) / (TOTAL - SHADE_END));
        ctx.globalAlpha = blend;
        ctx.drawImage(sketch.photo, 0, 0);
        ctx.globalAlpha = 1;
      } else if (tip) {
        drawPencil(ctx, tip.x, tip.y, tip.angle);
      }
    }

    function tick(now) {
      if (!active) return;
      const progress = Math.min(TOTAL, now - start);
      let tip = null;

      if (progress <= FEATURE_END && sketch.strokes.length) {
        const span = progress <= OUTLINE_END
          ? (progress / OUTLINE_END) * Math.max(1, outlineCount || featureCount)
          : outlineCount + ((progress - OUTLINE_END) / (FEATURE_END - OUTLINE_END)) * Math.max(1, featureCount - outlineCount);
        const target = Math.min(sketch.strokes.length, Math.ceil(span));
        while (strokeCursor < target) {
          const stroke = sketch.strokes[strokeCursor];
          strokeLine(inkCtx, stroke, dpr);
          tip = tipFromStroke(stroke);
          strokeCursor += 1;
        }
      }

      if (progress > FEATURE_END && progress <= SHADE_END && sketch.hatches.length) {
        const shadeProgress = Math.min(1, (progress - FEATURE_END) / (SHADE_END - FEATURE_END));
        const target = Math.ceil(shadeProgress * sketch.hatches.length);
        maskCtx.strokeStyle = '#000';
        maskCtx.lineCap = 'round';
        while (hatchCursor < target) {
          const hatch = sketch.hatches[hatchCursor];
          maskCtx.globalAlpha = hatch.alpha;
          maskCtx.lineWidth = hatch.width;
          maskCtx.beginPath();
          maskCtx.moveTo(hatch.x, hatch.y);
          maskCtx.lineTo(hatch.x2, hatch.y2);
          maskCtx.stroke();
          tip = { x: hatch.x2, y: hatch.y2, angle: Math.atan2(hatch.y2 - hatch.y, hatch.x2 - hatch.x) };
          hatchCursor += 1;
        }
        maskCtx.globalAlpha = 1;
      }

      paint(progress, progress < SHADE_END ? tip : null);
      if (progress >= TOTAL) {
        setDone(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    paint(0, null);
    frame = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [done, ready, reduce, src]);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[1.2rem] bg-[#f3efe6]">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        fetchPriority="high"
        onLoad={() => setReady(true)}
        className={`absolute inset-0 h-full w-full object-contain ${!reduce && !done ? 'opacity-0' : ''}`}
      />
      {!reduce && !done ? <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden /> : null}
    </div>
  );
}
