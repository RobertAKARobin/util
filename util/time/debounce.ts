import type * as Type from '../types.d.ts';

export function debounce<Input>(
	callback: (input?: Input) => void,
	delay: number,
) {
	let timer: Type.Timer | null = null;
	return function(input?: Input) {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			callback(input);
			timer = null;
		}, delay);
	};
}
