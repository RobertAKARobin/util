import { print, suite } from './spec/index.ts';

import { spec as svgSpec } from './svg/svg.spec.ts';

import { makeDraggable } from './dom/makeDraggable.ts';
import { PathNavigator } from './math/pathNavigator.ts';
import { pointAlongPath } from './math/pointAlongPath.ts';
import { pointToSvg } from './svg/pointToSvg.ts';
import { style } from './dom/attributes.ts';
import { svgCreate } from './svg/svgCreate.ts';

export const spec = suite(`@robertakarobin/util/`, {}, svgSpec);

const results = await spec({});
print(results);

const svg = document.querySelector(`svg`)!;
style(svg, {
	border: `100px solid #eeeeee`,
});
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
makeDraggable(svgPointer);
svg.appendChild(svgPointer);

const path = svg.querySelector(`path`)!;
const navigator = PathNavigator.fromData(path.getAttribute(`d`)!);
svgPointer.addEventListener(`customdrag`, event => {
	const pointer = pointToSvg(svg, event.pointer);
	const target = pointAlongPath(pointer, navigator.segments);
	style(svgPointer, {
		cx: `${target.x}px`,
		cy: `${target.y}px`,
	});
});
