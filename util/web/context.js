export const runContexts = /** @type {const} */([
	`browser`,
	`server`,
]);

/**
 * @typedef {typeof runContexts[number]} RunContext
 */

/** @type {RunContext} */
export const runContext = typeof window !== `undefined`
	? `browser`
	: `server`;

export const defaultBaseUrl = new URL(`https://a.test`);

export const baseUrl = runContext === `browser`
	? new URL(document.baseURI)
	: process.env.baseURI === undefined
		? defaultBaseUrl
		: new URL(process.env.baseURI);

export const msPerTick = runContext === `browser` ? 16 : 1; // A browser tab in focus repaints at about 60FPS, or 16ms. However this is highly variable and shouldn't be relied upon
