import type * as Type from './types.d.ts';

export function debounce(
	callback: () => void,
	time: number,
) {
	let timer: Type.Timer | null = null;
	return function() {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			callback();
			timer = null;
		}, time);
	};
}
