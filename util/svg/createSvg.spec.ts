import { test } from '../spec/index.ts';

import { createSvg } from './createSvg.ts';

export const spec = test(`createSvg`, $ => {
	$.assert(x => x(createSvg(`g`)) instanceof SVGGElement);
	$.assert(x => x(createSvg(`path`)) instanceof SVGPathElement);
});
