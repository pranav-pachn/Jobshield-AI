/**
 * Central animation variants and configuration for Framer Motion
 * Used across landing, dashboard, and analyzer pages
 */

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const slideInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const slideInDownVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const slideInLeftVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const slideInRightVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/**
 * Stagger container for animating multiple children sequentially
 * Use with individual child variants for coordinated animations
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger container with faster timing for card entrances
 */
export const staggerContainerFastVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Word-by-word animation for hero text
 */
export const wordVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/**
 * Character-by-character animation for dramatic reveals
 */
export const charVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/**
 * Gradient pulse animation (works with CSS animations)
 * For cards with animated gradient backgrounds
 */
export const gradientPulseVariants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Hover effect for interactive elements
 */
export const hoverGlowVariants = {
  rest: {
    boxShadow: "0 0 10px rgba(59, 130, 246, 0.2)",
  },
  hover: {
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)",
    transition: { duration: 0.3 },
  },
};

/**
 * Rotation animation for globe/spinner
 */
export const rotateVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 60,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Soft pulse animation for glowing elements
 */
export const pulseGlowVariants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.4)",
      "0 0 40px rgba(59, 130, 246, 0.8)",
      "0 0 20px rgba(59, 130, 246, 0.4)",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Page transition animation on route change
 */
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
