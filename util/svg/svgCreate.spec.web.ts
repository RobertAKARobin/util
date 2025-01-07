import { test } from '../spec/index';

import { setStyle } from '../dom/attributes';
import { svgCreate } from './svgCreate';

const testSvg = await (await fetch(`/mock/test.svg`)).text();

export const spec = test(import.meta.url, $ => {
	document.body.innerHTML = testSvg;

	const subject = svgCreate(`circle`);
	$.assert(x => x(subject) instanceof SVGCircleElement);
	$.assert(x => x(svgCreate(`path`)) instanceof SVGPathElement);

	$.log(() => setStyle(subject, { cx: `100px` }));
	$.assert(x => x(subject.style.cx) === `100px`);

	$.log(() => subject.setAttribute(`cx`, `200`));
	$.assert(x => x(subject.getAttribute(`cx`)) === `200`);

	subject.setAttribute(`cx`, `3`);
});
