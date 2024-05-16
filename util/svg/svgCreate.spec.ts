import { test } from '../spec/index.ts';

import { setAttributes, setStyle } from '../dom/attributes.ts';
import { svgCreate } from './svgCreate.ts';

export const spec = test(import.meta.url, $ => {
	const subject = svgCreate(`circle`);
	$.assert(x => x(subject) instanceof SVGCircleElement);
	$.assert(x => x(svgCreate(`path`)) instanceof SVGPathElement);

	$.log(() => setStyle(subject, { cx: `100px` }));
	$.assert(x => x(subject.style.cx) === `100px`);

	$.log(() => setAttributes(subject, { cx: `200px` }));
	$.assert(x => x(subject.getAttribute(`cx`)) === `200px`);

	setAttributes(subject, {
		cx: 3,
	});
});
