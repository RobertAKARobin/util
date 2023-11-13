
export const appContexts = [
	`browser`,
	`build`,
] as const;

export type AppContext = typeof appContexts[number];

export const appContext: AppContext = typeof window !== `undefined`
	? `browser`
	: `build`;
