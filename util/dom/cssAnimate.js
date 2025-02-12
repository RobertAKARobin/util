/**
 * @import { AnimationData } from '../css/keyframes.js';
 */

/**
 * Play the animation with the input name once on the given target
 * @param {HTMLElement} target
 * @param {Pick<AnimationData<PropertyKey>, 'name' | 'timeDuration'>} input
 * @returns {Promise<void>}
 */
export function cssAnimate(target, input) {
	return new Promise(resolve => {
		/**
		 * @param {AnimationEvent} event
		 */
		const handler = event => {
			if (event.animationName === input.name) {
				target.style.setProperty(`animation`, `none`);
				target.removeEventListener(`animationend`, handler);
				resolve();
			}
		};
		target.addEventListener(`animationend`, handler);

		target.style.setProperty(`animation`, `${/** @type {string} */(input.name)} ${input.timeDuration}s forwards`);
	});
}
