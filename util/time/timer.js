import { preciseTo } from '../math/preciseTo.js';

export class Timer {
	/**
	 * @type {number}
	 */
	#last = NaN;

	get last() {
		return this.#last;
	}

	#paused = false;

	get paused() {
		return this.#paused;
	}

	/**
	 * The total amount of time the timer has been paused since its last `.restart`. Not public because it's incremented only when `.check` and `.pause` are called, so its value may not be what the user would expect.
	 */
	#pauseDuration = NaN;

	#pauseStart = NaN;

	/**
	 * The timestamp when `.pause()` was first called. Persists until `.restart()` is called
	 * @returns {number}
	 */
	get pauseStart() {
		return this.#pauseStart;
	}

	constructor() {
		this.restart();
	}

	check() {
		if (isNaN(this.#last)) {
			return NaN;
		}

		const now = performance.now();

		if (this.#paused) {
			this.#pauseDuration += now - this.#pauseStart;
		}

		const difference = now - this.#last + this.#pauseDuration;

		if (difference === 0) {
			return Number.MIN_VALUE; // Node's performance.now is higher-res than Chrome, which sometimes returns the same value multiple times. TODO3: Are there reasons to NOT always want performance.now() to increment?
		}

		return preciseTo(difference);
	}

	/**
	 * @param {boolean} isPaused
	 * @returns {this}
	 */
	pause(isPaused = true) {
		if (isPaused === this.#paused) {
			return this;
		}

		this.#paused = isPaused;

		const now = performance.now();

		if (this.#paused) {
			this.#pauseStart = now;
		} else {
			this.#pauseDuration += now - this.#pauseStart;
		}

		return this;
	}

	restart() {
		this.#last = performance.now();
		this.#pauseDuration = 0;
		this.#pauseStart = NaN;

		return this;
	}
}
