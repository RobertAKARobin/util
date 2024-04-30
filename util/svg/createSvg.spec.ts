import { test } from '../spec/index.ts';

import { createSvg } from './createSvg.ts';
import { style } from '../dom/attributes.ts';

export const spec = test(`createSvg`, $ => {
	const subject = createSvg(`circle`);
	$.assert(x => x(subject) instanceof SVGCircleElement);
	$.assert(x => x(createSvg(`path`)) instanceof SVGPathElement);

	$.log(() => style(subject, { cx: `100px` }));
	$.assert(x => x(subject.style.cx) === `100px`);
});
