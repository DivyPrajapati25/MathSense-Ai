// src/utils/animations.js

// Modal backdrop — fade in/out
export const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

// Modal dialog — fade + zoom
export const modalVariants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } },
};

// Dropdown — slide down + fade
export const dropdownVariants = {
  hidden:  { opacity: 0, y: -6, scaleY: 0.97, transformOrigin: "top" },
  visible: { opacity: 1, y: 0,  scaleY: 1, transition: { duration: 0.15, ease: "easeOut" } },
  exit:    { opacity: 0, y: -4, scaleY: 0.97, transition: { duration: 0.1, ease: "easeIn" } },
};

// Page section — fade up on mount
export const sectionVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Stagger container — children animate one by one
export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// Card — used inside stagger container
export const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Floating banner — slide up from bottom right
export const floatingBannerVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { delay: 1, duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: 16, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
};

// Navbar — fade down on load
export const navbarVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const navPillTransition = {
  type:      "spring",
  stiffness: 380,
  damping:   32,
  mass:      0.9,
};