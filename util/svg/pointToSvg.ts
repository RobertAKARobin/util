import type { CoordinateLike } from '../types.d.ts';
import { toCoordinate } from '../math/toCoordinate.ts';

export function pointToSvg(svg: SVGSVGElement, coordinate: CoordinateLike) {
	const { x, y } = toCoordinate(coordinate);
	const origin = new DOMPointReadOnly(x, y);
	const matrix = svg.getScreenCTM()!;
	const destination = origin.matrixTransform(matrix.inverse());
	return toCoordinate(destination);
};
