// Hero effects
export {createRevealSequence} from './effects/reveal';
export {createHoverLift} from './effects/hover-lift';
export {createBreathing} from './effects/breathing';
export {createLetterHover} from './effects/letter-hover';
export {createParallaxMouse, createScrollFade, createBackgroundDrift} from './effects/parallax';

// Other effects
export {createMagnetic, type MagneticOptions} from './effects/magnetic';
export {createTextScramble, initTextScramble} from './effects/text-scramble';
export {createSplitText} from './effects/split-text';
export {createSvgDraw, createSvgUnderline} from './effects/svg-draw';
export {createScrollProgress} from './effects/scroll-progress';
export {createParticles, createParticleBurst} from './effects/particles';
export {createCustomCursor} from './effects/custom-cursor';

// Types
export * from './types';
export * from "./presets";
export * from './effects/parallax';
export type {LetterHoverOptions} from './effects/letter-hover';
export type {HoverLiftOptions} from './effects/hover-lift';
export type {BreathingOptions} from './effects/breathing';
export type {RevealSequenceOptions} from './effects/reveal';

// Utils
export {onClientReady} from "./utils/client";
export * from "./utils/dom";
