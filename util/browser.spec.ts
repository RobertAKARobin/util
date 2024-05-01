import { print, suite } from './spec/index.ts';

import { spec as svgSpec } from './svg/svg.spec.ts';

import { constrain } from './math/constrain.ts';
import { makeDraggable } from './dom/makeDraggable.ts';
import { style } from './dom/attributes.ts';

export const spec = suite(`@robertakarobin/util/`, {}, svgSpec);

const results = await spec({});
console.log(print(results));

const svg = document.querySelector(`svg`) as SVGSVGElement;
makeDraggable(svg);
svg.addEventListener(`customdrag`, event => {
	style(svg, {
		left: `${event.pointerOffset.x}px`,
		top: `${event.pointerOffset.y}px`,
	});
});

const svgPointer = svg.querySelector(`circle`)!;
makeDraggable(svgPointer, { offsetOrigin: `center` });
svgPointer.addEventListener(`customdrag`, event => {
	const cx = constrain(0, event.pointerOffset.x, svg.width.animVal.value);
	const cy = constrain(0, event.pointerOffset.y, svg.height.animVal.value);
	style(svgPointer, {
		cx: `${cx}px`,
		cy: `${cy}px`,
	});
});
