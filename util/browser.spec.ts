import { print, suite } from './spec/index.ts';

import { spec as svgSpec } from './svg/svg.spec.ts';

import { constrain } from './math/constrain.ts';
import { makeDraggable } from './dom/makeDraggable.ts';
import { PathNavigator } from './svg/pathNavigator.ts';
import { pointsToLines } from './svg/pointsToLines.ts';
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
for (const point of navigator.toPoints()) {
	const circle = svgCreate(`circle`);
	style(circle, {
		cx: `${point.x}px`,
		cy: `${point.y}px`,
		fill: `blue`,
		r: `5px`,
	});
	svg.appendChild(circle);
}

for (const { begin, end } of pointsToLines(navigator.toPoints())) {
	const line = svgCreate(`polyline`);
	line.setAttribute(`points`, `${begin.x},${begin.y} ${end.x},${end.y}`);
	style(line, {
		stroke: `blue`,
		strokeWidth: `1px`,
	});
	svg.appendChild(line);
}
