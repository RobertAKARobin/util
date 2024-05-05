import type { CoordinateLike } from '../types.d.ts';
import { toCoordinate } from '../math/toCoordinate.ts';

/**
 * Converts the coordinate at the given viewport x/y to the given SVG's x/y
 */
export function pointToSvg(svg: SVGSVGElement, coordinate: CoordinateLike) {
	const { x, y } = toCoordinate(coordinate);
	const origin = new DOMPointReadOnly(x, y);
	const matrix = svg.getScreenCTM()!;
	const destination = origin.matrixTransform(matrix.inverse());
	return toCoordinate(destination);
};
