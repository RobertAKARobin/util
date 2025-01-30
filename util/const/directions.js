import { enumy } from '../group/enumy';;

/**
 * @typedef {keyof typeof directions} Direction
 */

export const directionsByIndex = /** @type {const} */([
	`N`,
	`NE`,
	`E`,
	`SE`,
	`S`,
	`SW`,
	`W`,
	`NW`,
]);

export const directions = enumy(...directionsByIndex);

export const degreesByDirection = directionsByIndex.reduce(
	(directions, directionName, index) => {
		directions[directionName] = index * 45;
		return directions;
	},
	/** @type {Record<keyof typeof directions, number>} */({}),
);
