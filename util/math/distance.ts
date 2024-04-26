export function distance(pointA: [number, number], pointB: [number, number]) {
	return Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]);
}
