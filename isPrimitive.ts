export function isPrimitive(val: unknown): boolean {
	return typeof val === `object`
		? false
		: typeof val === `function`
			?	false
			: true;
}
