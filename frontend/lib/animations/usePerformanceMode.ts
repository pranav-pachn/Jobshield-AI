/**
 * Hook to detect device performance capabilities and user accessibility preferences
 * Returns performance mode to conditionally render/disable animations
 */

import { useEffect, useState } from "react";

export type PerformanceMode = "full" | "reduced" | "mobile";

interface DeviceCapabilities {
  prefersReducedMotion: boolean;
  isMobile: boolean;
  cpuCores: number;
  hasGPU: boolean;
}

/**
 * Detect user's motion reduction preference
 */
function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Detect if device is mobile
 */
function getIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua
  );
}

/**
 * Estimate CPU cores (approximate)
 */
function getCpuCores(): number {
  if (typeof navigator === "undefined") return 4;
  return navigator.hardwareConcurrency || 4;
}

/**
 * Detect WebGL/GPU support
 */
function getHasGPU(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Main hook: Determine performance mode
 */
export function usePerformanceMode(): PerformanceMode {
  const [mode, setMode] = useState<PerformanceMode>("full");

  useEffect(() => {
    const prefersReducedMotion = getPrefersReducedMotion();
    const isMobile = getIsMobile();
    const cpuCores = getCpuCores();
    const hasGPU = getHasGPU();

    // Reduce motion if accessibility preference is set
    if (prefersReducedMotion) {
      setMode("reduced");
      return;
    }

    // Mobile mode for phones/tablets
    if (isMobile && cpuCores < 4) {
      setMode("mobile");
      return;
    }

    // Full mode for capable devices
    if (hasGPU && cpuCores >= 4) {
      setMode("full");
      return;
    }

    // Reduced for underpowered devices
    setMode("reduced");
  }, []);

  return mode;
}

/**
 * Hook to get detailed device capabilities
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    prefersReducedMotion: false,
    isMobile: false,
    cpuCores: 4,
    hasGPU: false,
  });

  useEffect(() => {
    setCapabilities({
      prefersReducedMotion: getPrefersReducedMotion(),
      isMobile: getIsMobile(),
      cpuCores: getCpuCores(),
      hasGPU: getHasGPU(),
    });
  }, []);

  return capabilities;
}

/**
 * Hook to listen for motion preference changes
 */
export function useMotionPreference(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Conditionally render animation based on performance mode
 */
export function shouldAnimate(
  performanceMode: PerformanceMode,
  animationType: "heavy" | "medium" | "light" = "medium"
): boolean {
  if (performanceMode === "reduced") return false;

  if (performanceMode === "mobile") {
    // Only heavy animations are disabled on mobile
    return animationType !== "heavy";
  }

  // Full mode: animate everything
  return true;
}
