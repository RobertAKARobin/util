import { test } from '../spec/index.js';

import { msPerTick } from '../web/context.js';
import { sleep } from '../time/sleep.js';

import { cssAnimate } from './cssAnimate.js';

export const spec = test(import.meta.url, async $ => {
	document.body.innerHTML += `<div id="target"></div>`;
	const target = /** @type {HTMLElement} */(document.getElementById(`target`));

	const style = document.createElement(`STYLE`);
	const cssRule = `
@keyframes tada {
	from { opacity: 0 }
	to: { opacity: 1 }
}
`;
	style.textContent = cssRule;
	document.head.appendChild(style);

	$.assert(x => x(target.id) === `target`);
	$.assert(x => x(target.style.getPropertyValue(`animation-name`)) === ``);

	const timeDuration = .42;
	let isResolved = false;

	void cssAnimate(target, {
		name: `tada`,
		timeDuration,
	}).then(() => isResolved = true);

	$.assert(x => x(target.style.getPropertyValue(`animation-name`)) === `tada`);
	$.assert(x => x(target.style.getPropertyValue(`animation-duration`)) === `0.42s`);
	$.assert(x => x(target.style.getPropertyValue(`animation-fill-mode`)) === `forwards`);
	$.assert(x => x(isResolved) === false);

	await sleep((timeDuration * 1000) + msPerTick);

	$.assert(x => x(target.style.getPropertyValue(`animation-name`)) === ``);
	$.assert(x => x(isResolved) === true);
});
