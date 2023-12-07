export function delay(
	callback: () => unknown,
	time: number,
) {
	return new Promise(resolve => {
		setTimeout(() => resolve(callback()), time);
	});
}
