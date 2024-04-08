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
}`;

const multi = keyframesMulti(
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
	}
);

const keyframesFront = `0% {opacity: 0; top: 50%}
25% {opacity: 1; top: 50%}
100% {top: 0%}`;

const keyframesContainer = `0% {background: #fff; opacity: 0}
10% {opacity: 1}
50% {background: #fff}
55% {background: #f00; opacity: 1}
100% {opacity: 0}`;

export const spec = test(`Keyframes`, $ => {
	$.assert(x => x(diff(animation, result)) === ``);

	$.assert(x => x(diff(multi.container.keyframes.join(`\n`), keyframesContainer)) === ``);
	$.assert(x => x(multi.container.timeStart) === 0);
	$.assert(x => x(multi.container.timeEnd) === 10);
	$.assert(x => x(multi.container.timeDuration) === 10);

	$.assert(x => x(diff(multi.front.keyframes.join(`\n`), keyframesFront)) === ``);
	$.assert(x => x(multi.front.timeStart) === 1);
	$.assert(x => x(multi.front.timeEnd) === 5);
	$.assert(x => x(multi.front.timeDuration) === 4);
});

