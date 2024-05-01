import { print, suite } from './spec/index.ts';

import { spec as svgSpec } from './svg/svg.spec.ts';

import { circleDrag } from './svg/circleDrag.ts';
import { makeDraggable } from './dom/makeDraggable.ts';
import { style } from './dom/attributes.ts';

export const spec = suite(`@robertakarobin/util/`, {}, svgSpec);

const results = await spec({});
console.log(print(results));

const svg = document.querySelector(`svg`) as SVGSVGElement;
const svgPointer = svg.querySelector(`circle`)!;
circleDrag(svgPointer);

const divPointer = document.getElementById(`pointer`)!;
makeDraggable(divPointer, event => {
	style(divPointer, {
		left: `${event.pointerOffset.x}px`,
		top: `${event.pointerOffset.y}px`,
	});
});
