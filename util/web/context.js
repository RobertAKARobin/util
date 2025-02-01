
export const runContexts = [
	`browser`,
	`server`,
] as const;

export type RunContext = typeof runContexts[number];

export const runContext: RunContext = typeof window !== `undefined`
	? `browser`
	: `server`;

export const defaultBaseUrl = new URL(`https://a.test`);

export const baseUrl = runContext === `browser`
	? new URL(document.baseURI)
	: process.env.baseURI === undefined
		? defaultBaseUrl
		: new URL(process.env.baseURI);
