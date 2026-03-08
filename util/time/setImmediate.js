import { runContext } from '../web/context.js';

/**
 * requestAnimationFrame in browser environments, which usually has a "tick" of 60FPS/16ms, setImmediate otherwise, which is usually ~1ms
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
 * https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate
 */
export const setImmediate = runContext === `browser`
	? globalThis.requestAnimationFrame.bind(globalThis) // Throws "Illegal invocation" if `this` not `null` or `window
	: globalThis.setImmediate;
