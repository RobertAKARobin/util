import { preciseTo } from '../math/preciseTo.js';

export class Timer {
	get elapsed() {
		if (isNaN(this.#start)) {
			return 0;
		}

		const now = performance.now();

		let difference = now - this.#start + this.#pauseDurationCumulative;

		if (this.#paused) {
			difference -= now - this.#pauseStart;
		}

		if (difference === 0) {
			return Number.MIN_VALUE; // Node's performance.now is higher-res than Chrome, which sometimes returns the same value multiple times. TODO3: Are there reasons to NOT always want performance.now() to increment?
		}

		return preciseTo(difference);
	}

	#paused = false;

	get paused() {
		return this.#paused;
	}

	get pauseDuration() {
		if (this.#paused) {
			return performance.now() - this.pauseStart;
		}

		return 0;
	}

	#pauseDurationCumulative = 0;

	/**
	 * The total amount of time the timer has been paused since its last `.restart`.
	 * NOTE: Updates only when changing from paused to unpaused. If timer is currently paused, calculate this with `now - .pauseStart`
	 * @returns {number}
	 */
	get pauseDurationCumulative() {
		return this.#pauseDurationCumulative;
	}

	#pauseStart = NaN;

	/**
	 * The timestamp when `.pause()` was first called. Persists until `.restart()` is called
	 * @returns {number}
	 */
	get pauseStart() {
		return this.#pauseStart;
	}

	/**
	 * @type {number}
	 */
	#start = NaN;

	get start() {
		return this.#start;
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
			this.#pauseDurationCumulative += now - this.#pauseStart;
		}

		return this;
	}

	restart() {
		this.#start = performance.now();
		this.#pauseDurationCumulative = 0;
		this.#pauseStart = NaN;
		this.#paused = false;

		return this;
	}
}
