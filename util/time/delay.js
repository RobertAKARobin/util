export function delay(
	callback: () => unknown,
	milliseconds: number,
) {
	return new Promise(resolve => {
		setTimeout(() => resolve(callback()), milliseconds);
	});
}
