
export const appContexts = [
	`browser`,
	`build`,
] as const;

export type AppContext = typeof appContexts[number];

export const appContext: AppContext = typeof window !== `undefined`
	? `browser`
	: `build`;

export const defaultBaseUrl = new URL(`https://a.a`);

export const baseUrl = appContext === `browser`
	? new URL(document.baseURI)
	: process.env.baseURI === undefined
		? defaultBaseUrl
		: new URL(process.env.baseURI);
