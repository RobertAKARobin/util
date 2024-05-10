import { enumy } from '../group/enumy.ts';

export const directionsByIndex = [
	`N`,
	`NE`,
	`E`,
	`SE`,
	`S`,
	`SW`,
	`W`,
	`NW`,
] as const;

export const directions = enumy(...directionsByIndex);

export const degreesByDirection = directionsByIndex.reduce(
	(directions, directionName, index) => {
		directions[directionName] = index * 45;
		return directions;
	},
	{} as Record<keyof typeof directions, number>
);
