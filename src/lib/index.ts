// Hero effects
export { createRevealSequence } from './effects/reveal';
export type { RevealSequenceOptions } from './effects/reveal';

export {createHoverLift} from './effects/hover-lift';
export type {HoverLiftOptions} from './effects/hover-lift';

export { createBreathing, initBreathing } from './effects/breathing';
export type { BreathingOptions } from './effects/breathing';

export { createLetterHover } from './effects/letter-hover';
export type { LetterHoverOptions } from './effects/letter-hover';

export {
    createParallaxMouse,
    createScrollFade,
    createBackgroundDrift,
    initParallaxEffects
} from './effects/parallax';
export type {
    ParallaxMouseOptions,
    ScrollFadeOptions,
    BackgroundDriftOptions
} from './effects/parallax';

// Other effects
export { createMagnetic, initMagnetic } from './effects/magnetic';
export { createTextScramble, initTextScramble } from './effects/text-scramble';
export { createSplitText, initSplitText } from './effects/split-text';
export { createSvgDraw, createSvgUnderline, initSvgDraw } from './effects/svg-draw';
export { createScrollProgress, initScrollProgress } from './effects/scroll-progress';
export { createParticles, createParticleBurst, initParticles } from './effects/particles';
export { createCustomCursor, initCustomCursor } from './effects/custom-cursor';

// Types
export * from './types';
export * from "./utils/dom";
