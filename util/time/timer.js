import { preciseTo } from '../math/preciseTo.js';

export class Timer {
	get elapsed() {
		if (isNaN(this._start)) {
			return 0;
		}

		const now = this.now;

		let difference = now - this.start + this.pauseDurationCumulative;

		if (this._paused) {
			difference -= now - this.pauseStart;
		}

		if (difference === 0) {
			return Number.MIN_VALUE; // Node's performance.now is higher-res than Chrome, which sometimes returns the same value multiple times. TODO3: Are there reasons to NOT always want performance.now() to increment?
		}

		return preciseTo(difference);
	}

	get now() {
		return performance.now();
	}

	_paused = false;

	get paused() {
		return this._paused;
	}

	get pauseDuration() {
		if (this._paused) {
			return this.now - this.pauseStart;
		}

		return 0;
	}

	_pauseDurationCumulative = 0;

	/**
	 * The total amount of time the timer has been paused since its last `.restart`.
	 * NOTE: Updates only when changing from paused to unpaused. If timer is currently paused, calculate this with `now - .pauseStart`
	 * @returns {number}
	 */
	get pauseDurationCumulative() {
		return this._pauseDurationCumulative;
	}

	_pauseStart = NaN;

	/**
	 * The timestamp when `.pause()` was first called. Persists until `.restart()` is called
	 * @returns {number}
	 */
	get pauseStart() {
		return this._pauseStart;
	}

	_start = NaN;

	get start() {
		return this._start;
	}

	constructor() {
		this.reset();
	}

	/**
	 * @param {boolean} isPaused
	 * @returns {this}
	 */
	pause(isPaused = true) {
		if (isPaused === this._paused) {
			return this;
		}

		this._paused = isPaused;

		const now = this.now;

		if (this._paused) {
			this._pauseStart = now;
		} else {
			this._pauseDurationCumulative += now - this._pauseStart;
		}

		return this;
	}

	reset() {
		this._start = this.now;
		this._pauseDurationCumulative = 0;
		this._pauseStart = NaN;
		this._paused = false;

		return this;
	}
}
