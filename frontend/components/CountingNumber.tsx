"use client";

import { useEffect, useRef, useState } from "react";

interface CountingNumberProps {
  target: number;
  duration?: number;
  className?: string;
  decimals?: number;
  onComplete?: () => void;
}

export function CountingNumber({
  target,
  duration = 1200,
  className = "",
  decimals = 0,
  onComplete,
}: CountingNumberProps) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(target * easeProgress * Math.pow(10, decimals)) / Math.pow(10, decimals);

      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, decimals, onComplete]);

  return (
    <span className={className}>
      {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}
    </span>
  );
}
