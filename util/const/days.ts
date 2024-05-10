export const daysOfWeek = [
	`Sunday`,
	`Monday`,
	`Tuesday`,
	`Wednesday`,
	`Thursday`,
	`Friday`,
	`Saturday`,
] as const;

export type DayOfWeek = typeof daysOfWeek[number];
