export const cssUnits = /** @type {const} */([
	`%`,
	`ch`,
	`cm`,
	`em`,
	`ex`,
	`mm`,
	`Q`,
	`in`,
	`pc`,
	`pt`,
	`px`,
	`rem`,
	`vh`,
	`vw`,
]);

/**
 * @typedef {cssUnits[number]} cssUnit
 */

export class CssUnit {
	/**
	 * @type {cssUnit}
	 */
	unit;

	/**
	 * @type {number}
	 */
	value;

	/**
	 * @param {number} value
	 * @param {cssUnit} unit
	 */
	constructor(value, unit) {
		this.value = value;
		this.unit = unit;
	}

	toString() {
		return `${this.value}${this.unit}`;
	}

	valueOf() {
		return this.value;
	}
}

/**
 * @typedef {(value: number) => CssUnit} cssUnitFactory
 */

export const cssUnit = /** @type {Record<cssUnit, cssUnitFactory>} */(
	Object.fromEntries(
		cssUnits.map(unit => [
			unit,
			(/** @type {number} */value) => new CssUnit(value, unit),
		]),
	)
);
