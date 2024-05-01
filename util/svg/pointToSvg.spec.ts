import { test } from '../spec/index.ts';

import { createSvg } from './createSvg.ts';
import { pointToSvg } from './pointToSvg.ts';
import { style } from 'util/dom/attributes.ts';

export const spec = test(`pointToSvg`, $ => {
	const svg = document.querySelector(`svg`)!;
	style(svg, {
		height: `200px`, // Make sure positioning works when the svg is scaled
	});

	const bounds = svg.getBoundingClientRect();
	const target = [bounds.left + (bounds.width / 2), bounds.top + (bounds.height / 2)];
	const { x, y } = pointToSvg(svg, target);

	const pointer = createSvg(`circle`);
	style(pointer, {
		cx: `${x}px`,
		cy: `${y}px`,
		fill: `red`,
		r: `10px`,
	});
	svg.appendChild(pointer);

	$.assert(x => x(bounds.height) === 200);
	$.assert(x => x(bounds.width) === 100);
	$.assert(x => x(pointer.style.cx) === `50px`);
	$.assert(x => x(pointer.style.cy) === `50px`);
});
