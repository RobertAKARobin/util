import { keyframes, keyframesMulti } from './keyframes.ts';
import { diff } from '../spec/diff.ts';
import { test } from '../spec/index.ts';

const animation = keyframes(`
	position: absolute;
	bottom: 100%;
`,

1, `
	bottom: 0%;
`,

8, `
	bottom: 0%;
`,

1, `
	bottom: -100%;
`,
);

const result = `0% {
	position: absolute;
	bottom: 100%;
}
10% {
	bottom: 0%;
}
90% {
	bottom: 0%;
}
100% {
	bottom: -100%;
}
`;

const animations = keyframesMulti(
	{
		container: `background: #fff; opacity: 0`,
		front: undefined,
	},

	1, {
		container: `opacity: 1`,
		front: `opacity: 0; top: 50%`,
	},

	1, {
		front: `opacity: 1; top: 50%`,
	},

	3, {
		container: `background: #fff`,
		front: `top: 0%`,
	},

	.5, {
		container: `background: #f00; opacity: 1`,
	},

	4.5, {
		container: `opacity: 0`,
	},
);

const keyframesFront = `0% {opacity: 0; top: 50%}
25% {opacity: 1; top: 50%}
100% {top: 0%}
`;

const keyframesContainer = `0% {background: #fff; opacity: 0}
10% {opacity: 1}
50% {background: #fff}
55% {background: #f00; opacity: 1}
100% {opacity: 0}
`;

const keyframesCombined = `@keyframes container {
${keyframesContainer}}
@keyframes front {
${keyframesFront}}
`;

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(diff(animation, result)) === ``);

	$.assert(x => x(Object.keys(animations).sort().join(`,`)) === `container,front`);

	$.assert(x => x(animations.container.initialState) === `background: #fff; opacity: 0`);
	$.assert(x => x(diff(animations.container.keyframes, keyframesContainer)) === ``);
	$.assert(x => x(animations.container.timeStart) === 0);
	$.assert(x => x(animations.container.timeEnd) === 10);
	$.assert(x => x(animations.container.timeDuration) === 10);

	$.assert(x => x(animations.front.initialState) === `opacity: 0; top: 50%`);
	$.assert(x => x(diff(animations.front.keyframes, keyframesFront)) === ``);
	$.assert(x => x(animations.front.timeStart) === 1);
	$.assert(x => x(animations.front.timeEnd) === 5);
	$.assert(x => x(animations.front.timeDuration) === 4);

	$.assert(x => x(diff(animations.toString(), keyframesCombined)) === ``);
});

