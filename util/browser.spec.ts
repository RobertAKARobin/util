import { print, suite } from './spec/index.ts';

import { spec as svgSpec } from './svg/svg.spec.ts';

import type { Bezier } from './types.d.ts';
import { bezierToLines } from './math/bezierToLines.ts';
import { constrain } from './math/constrain.ts';
import { makeDraggable } from './dom/makeDraggable.ts';
import { PathNavigator } from './svg/pathNavigator.ts';
import { style } from './dom/attributes.ts';
import { svgCreate } from './svg/svgCreate.ts';

export const spec = suite(`@robertakarobin/util/`, {}, svgSpec);

const results = await spec({});
print(results);

const svg = document.querySelector(`svg`)!;
makeDraggable(svg);
svg.addEventListener(`customdrag`, event => {
	style(svg, {
		left: `${event.pointerOffset.x}px`,
		top: `${event.pointerOffset.y}px`,
	});
});

const svgPointer = svgCreate(`circle`);
style(svgPointer, {
	cx: `50px`,
	cy: `50px`,
	fill: `red`,
	r: `10px`,
});
svg.appendChild(svgPointer);

makeDraggable(svgPointer, { offsetOrigin: `center` });
svgPointer.addEventListener(`customdrag`, event => {
	const cx = constrain(0, event.pointerOffset.x, svg.width.animVal.value);
	const cy = constrain(0, event.pointerOffset.y, svg.height.animVal.value);
	style(svgPointer, {
		cx: `${cx}px`,
		cy: `${cy}px`,
	});
});

const path = svg.querySelector(`path`)!;
const navigator = PathNavigator.fromData(path.getAttribute(`d`)!);
const lines = bezierToLines(...navigator.segments[4] as Bezier);
for (const line of lines) {
	const polyline = svgCreate(`polyline`);
	style(polyline, {
		stroke: `red`,
		strokeWidth: `5px`,
	});
	polyline.setAttribute(`points`, `${line.begin.x},${line.begin.y} ${line.end.x},${line.end.y}`);
	svg.appendChild(polyline);
}
