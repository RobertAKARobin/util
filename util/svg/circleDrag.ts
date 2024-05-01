import { constrain } from '../math/constrain.ts';
import { makeDraggable } from '../dom/makeDraggable.ts';
import { pointToSvg } from './pointToSvg.ts';
import { style } from '../dom/attributes.ts';

/**
 * Makes a SVGCicle draggable within its parent SVG
 */
export function circleDrag(pointer: SVGCircleElement) {
	const svg = pointer.ownerSVGElement!;
	makeDraggable(pointer, event => {
		const bounds = pointer.getBBox();
		const origin = pointToSvg(svg, [event.pointerOffset.x, event.pointerOffset.y]);
		const cx = constrain(0, origin.x + (bounds.width / 2), svg.width.animVal.value);
		const cy = constrain(0, origin.y + (bounds.height / 2), svg.height.animVal.value);
		style(pointer, {
			cx: `${cx}px`,
			cy: `${cy}px`,
		});
	});
}
