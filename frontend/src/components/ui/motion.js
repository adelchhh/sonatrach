/**
 * Sonatrach motion presets — discipline corporate.
 *
 * Règles :
 *   - Durées courtes : 200-400 ms max
 *   - Easings smooth (cubic-bezier Apple-style), jamais de springs bouncy
 *   - viewport.once = true pour ne pas répéter au scroll
 *   - On anime opacité + translateY/scale légers — pas de slides spectaculaires
 */

export const easings = {
  smooth: [0.22, 1, 0.36, 1], // Apple/Stripe — décélération douce
  swift: [0.32, 0.72, 0, 1], // Out-cubic, plus tranchant
  inOut: [0.4, 0, 0.2, 1], // Material standard
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: easings.smooth },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: easings.smooth },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easings.smooth },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.28, ease: easings.smooth },
};

export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: easings.smooth },
};

export const modalPanel = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 4 },
  transition: { duration: 0.28, ease: easings.smooth },
};

/** Stagger un container et ses enfants. */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easings.smooth },
  },
};

/** À utiliser avec whileInView pour révéler une section au scroll. */
export const revealOnScroll = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: easings.smooth },
};

/** Hover discret sur une carte (élévation imperceptible). */
export const hoverLift = {
  whileHover: { y: -2 },
  transition: { duration: 0.2, ease: easings.smooth },
};

/** Hover sur un poster (échelle subtile). */
export const hoverScale = {
  whileHover: { scale: 1.015 },
  transition: { duration: 0.25, ease: easings.smooth },
};
