import { diff } from '../spec/diff.ts';
import { keyframes } from './keyframes.ts';
import { test } from '../spec/index.ts';

const animation = keyframes(`
	position: absolute;
	bottom: 100%;
`,
0, // At 0 sec, end active keyframe. Start tweening to next keyframe
`
	bottom: 0%;
`,
1, // At 1 sec, stop tweening
8, // At 9 sec, start tweening to next
`
	bottom: -100%;
`,
1 // At 10 sec, stop tweening
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

export const spec = test(`Keyframes`, $ => {
	$.assert(x => x(diff(animation, result)) === ``);
});
