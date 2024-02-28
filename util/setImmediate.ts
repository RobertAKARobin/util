import { appContext } from './context.ts';

/**
 * requestAnimationFrame in browser environments, setImmediate otherwise
 * https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
 * https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate
 */
export const setImmediate = appContext === `browser`
	? globalThis.requestAnimationFrame.bind(globalThis) // Throws "Illegal invocation" if `this` not `null` or `window
	: globalThis.setImmediate;
