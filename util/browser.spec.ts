import { print, suite } from './spec/index.ts';

import { spec as svgSpec } from './svg/svg.spec.ts';

import { makeDraggable } from './dom/makeDraggable.ts';
import { PathNavigator } from './svg/pathNavigator.ts';
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

const path = svg.querySelector(`path`)!;
const navigator = PathNavigator.fromData(path.getAttribute(`d`)!);
svg.addEventListener(`click`, event => {
	const pointer = pointToSvg(svg, [event.clientX, event.clientY]);
	const target = pointAlongPath(pointer, navigator.segments);
	style(svgPointer, {
		cx: `${target.x}px`,
		cy: `${target.y}px`,
	});
});
