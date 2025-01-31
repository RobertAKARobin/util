import type * as Type from '../types.d';

export function throttle(
	callback: () => unknown,
	time: number,
) {
	let timer: Type.Timer | null = null;
	return function() {
		if (timer) {
			return;
		}

		timer = setTimeout(() => {
			callback();
			timer = null;
		}, time);
	};
}
