export type Routes = Record<
	string,
	| string
	| ((...args: Array<any>) => string) // eslint-disable-line @typescript-eslint/no-explicit-any
>;
