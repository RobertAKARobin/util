import { test } from '../spec/index.ts';

import { style } from '../dom/attributes.ts';
import { svgCreate } from './svgCreate.ts';

export const spec = test(import.meta.url, $ => {
	const subject = svgCreate(`circle`);
	$.assert(x => x(subject) instanceof SVGCircleElement);
	$.assert(x => x(svgCreate(`path`)) instanceof SVGPathElement);

	$.log(() => style(subject, { cx: `100px` }));
	$.assert(x => x(subject.style.cx) === `100px`);
});
