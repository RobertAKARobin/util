import { type AnimationData } from '../css/keyframes.ts';

export function cssAnimate(
	target: HTMLElement,
	input: Pick<AnimationData,
		| `name`
		| `timeDuration`
	>,
) {
	return new Promise<void>(resolve => {
		const handler = (event: AnimationEvent) => {
			if (event.animationName === input.name) {
				target.style.setProperty(`animation`, `none`);
				target.removeEventListener(`animationend`, handler);
				resolve();
			}
		};
		target.addEventListener(`animationend`, handler);

		target.style.setProperty(`animation`, `${input.name as string} ${input.timeDuration}s forwards`);
	});
}
