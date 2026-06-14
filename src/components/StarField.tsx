import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkle: number;
  twinkleSpeed: number;
}

interface StarLayerConfig {
  count: number;
  sizeRange: [number, number];
  speedRange: [number, number];
  opacityRange: [number, number];
  color: string;
}

const LAYER_CONFIGS: StarLayerConfig[] = [
  {
    count: 150,
    sizeRange: [0.5, 1.2],
    speedRange: [0.05, 0.15],
    opacityRange: [0.2, 0.5],
    color: '#6B7280',
  },
  {
    count: 120,
    sizeRange: [1, 2],
    speedRange: [0.15, 0.35],
    opacityRange: [0.4, 0.7],
    color: '#9CA3AF',
  },
  {
    count: 80,
    sizeRange: [1.5, 3],
    speedRange: [0.35, 0.7],
    opacityRange: [0.6, 1],
    color: '#E5E7EB',
  },
];

function createStars(
  width: number,
  height: number,
  config: StarLayerConfig,
): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < config.count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0],
      speed: Math.random() * (config.speedRange[1] - config.speedRange[0]) + config.speedRange[0],
      opacity: Math.random() * (config.opacityRange[1] - config.opacityRange[0]) + config.opacityRange[0],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    });
  }
  return stars;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const starsRef = useRef<Star[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      starsRef.current = LAYER_CONFIGS.map((config) =>
        createStars(window.innerWidth, window.innerHeight, config),
      );
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      starsRef.current.forEach((layer, layerIndex) => {
        const config = LAYER_CONFIGS[layerIndex];
        ctx.fillStyle = config.color;

        layer.forEach((star) => {
          star.twinkle += star.twinkleSpeed;
          const twinkleOpacity = star.opacity * (0.7 + 0.3 * Math.sin(star.twinkle));
          star.y += star.speed;

          if (star.y > height + 5) {
            star.y = -5;
            star.x = Math.random() * width;
          }
          if (star.x > width) star.x = 0;
          if (star.x < 0) star.x = width;

          ctx.globalAlpha = twinkleOpacity;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#0d0d20] to-[#111133]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  );
}
