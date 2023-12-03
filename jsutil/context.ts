
export const appContexts = [
	`browser`,
	`build`,
] as const;

export type AppContext = typeof appContexts[number];

export const appContext: AppContext = typeof window !== `undefined`
	? `browser`
	: `build`;

export const baseHref = appContext === `browser`
	? new URL(document.baseURI)
	: new URL(`https://example.com`);
