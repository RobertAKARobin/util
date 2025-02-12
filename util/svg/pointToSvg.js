/**
 * @import { Coordinate, CoordinateLike } from '../2d/types.d';
 */

import { toCoordinate } from '../2d/toCoordinate.js';

/**
 * Converts the coordinate at the given viewport x/y to the given SVG's x/y
 * @param {SVGSVGElement} svg
 * @param {CoordinateLike} coordinate
 * @returns {Coordinate}
 */
export function pointToSvg(svg, coordinate) {
	const { x, y } = toCoordinate(coordinate);
	const origin = new DOMPointReadOnly(x, y);
	const matrix = /** @type {DOMMatrix} */(svg.getScreenCTM());
	const destination = origin.matrixTransform(matrix.inverse());
	return toCoordinate(destination);
};
