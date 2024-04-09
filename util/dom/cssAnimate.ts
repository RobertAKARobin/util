import { type AnimationData } from '../css/keyframes.ts';

export async function cssAnimate(
	target: HTMLElement,
	input: Pick<AnimationData,
		| `initialState`
		| `name`
		| `timeDuration`
	>
) {
	return new Promise<void>(resolve => {
		target.addEventListener(`animationend`, event => {
			if (event.animationName === input.name) {
				resolve();
			}
		}, { once: true });

		target.style.setProperty(`animation-duration`, `${input.timeDuration}s`);
		target.style.setProperty(`animation-fill-mode`, `forwards`);
		target.style.setProperty(`animation-name`, input.name as string);
	});
}
