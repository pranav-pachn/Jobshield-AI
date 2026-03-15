/**
 * Gradient animation utilities for Tailwind CSS
 * These are applied via dynamic className management or CSS-in-JS
 */

/**
 * Tailwind CSS extension for gradient animations
 * Add to tailwind.config.ts:
 *
 * extend: {
 *   animation: {
 *     'gradient-flow': 'gradient-flow 10s ease-in-out infinite',
 *     'gradient-pulse': 'gradient-pulse 8s ease-in-out infinite',
 *   },
 *   keyframes: {
 *     'gradient-flow': {
 *       '0%': { backgroundPosition: '0% 50%' },
 *       '50%': { backgroundPosition: '100% 50%' },
 *       '100%': { backgroundPosition: '0% 50%' },
 *     },
 *     'gradient-pulse': {
 *       '0%': { opacity: '0.8' },
 *       '50%': { opacity: '1' },
 *       '100%': { opacity: '0.8' },
 *     },
 *   },
 * }
 */

/**
 * Dynamic gradient background style generator
 * Creates a CSS object with gradient animation
 */
export function getGradientAnimationStyle(duration: number = 10) {
  return {
    backgroundImage:
      "linear-gradient(45deg, rgb(59, 130, 246, 0.4), rgb(147, 51, 234, 0.4), rgb(59, 130, 246, 0.4))",
    backgroundSize: "200% 200%",
    backgroundPosition: "0% 50%",
    animation: `gradient-flow ${duration}s ease-in-out infinite`,
  } as React.CSSProperties;
}

/**
 * Gradient variants for cybersecurity theme
 */
export const gradientThemes = {
  // Blue to Purple (Primary)
  bluePurple: {
    style:
      "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(147, 51, 234) 100%)",
    animated:
      "linear-gradient(45deg, rgb(59, 130, 246, 0.6), rgb(147, 51, 234, 0.6), rgb(59, 130, 246, 0.6))",
  },

  // Cyan to Blue (Secondary)
  cyanBlue: {
    style:
      "linear-gradient(135deg, rgb(34, 211, 238) 0%, rgb(59, 130, 246) 100%)",
    animated:
      "linear-gradient(45deg, rgb(34, 211, 238, 0.6), rgb(59, 130, 246, 0.6), rgb(34, 211, 238, 0.6))",
  },

  // Purple to Violet (AI Intelligence)
  purpleViolet: {
    style:
      "linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(168, 85, 247) 100%)",
    animated:
      "linear-gradient(45deg, rgb(147, 51, 234, 0.6), rgb(168, 85, 247, 0.6), rgb(147, 51, 234, 0.6))",
  },

  // Red Alert (High Risk)
  redAlert: {
    style:
      "linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)",
    animated:
      "linear-gradient(45deg, rgb(239, 68, 68, 0.6), rgb(220, 38, 38, 0.6), rgb(239, 68, 68, 0.6))",
  },

  // Green Safe
  greenSafe: {
    style:
      "linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)",
    animated:
      "linear-gradient(45deg, rgb(34, 197, 94, 0.6), rgb(22, 163, 74, 0.6), rgb(34, 197, 94, 0.6))",
  },

  // Yellow Warning
  yellowWarning: {
    style:
      "linear-gradient(135deg, rgb(234, 179, 8) 0%, rgb(202, 138, 4) 100%)",
    animated:
      "linear-gradient(45deg, rgb(234, 179, 8, 0.6), rgb(202, 138, 4, 0.6), rgb(234, 179, 8, 0.6))",
  },
};

/**
 * Apply animated gradient to an element
 * Returns className string for Tailwind usage
 */
export function getAnimatedGradientClass(
  theme: keyof typeof gradientThemes = "bluePurple"
) {
  return `bg-gradient-to-r animate-gradient-flow`;
}

/**
 * Gradient pulse for emphasis
 */
export const gradientPulseStyle = (delay: number = 0) => ({
  animation: `gradient-pulse 8s ease-in-out infinite`,
  animationDelay: `${delay}s`,
});
