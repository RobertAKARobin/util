import { enumy } from '../group/enumy.js';
import { setImmediate } from './setImmediate.js';
import { Timer } from './timer.js';

export const loopStatuses = /** @type {const} */([
	`unstarted`,
	`started`,
	`ended`,
]);

/**
 * @typedef {typeof loopStatuses[number]} LoopStatus
 */

export const loopStatus = enumy(...loopStatuses);

const msPerSecond = 1000;

/**
 * Loops over the given callback at the given number of iterations per second.
 * Note: this uses `requestAnimationFrame` in the browser, which has a rate of about 16ms in an active tab and may stop entirely in an inactive tab.
 * TODO2: Option to use web worker with setInterval?
 */
export class FPSLoop extends Timer {
	/**
	 * @type {() => void}
	 */
	doWhat;

	/**
	 * @type {number}
	 */
	duration;

	/**
	 * @type {Promise<void> | undefined}
	 */
	_ending = undefined;
	get ending() {
		return this._ending;
	}

	_iterationsSoFar = 0;
	get iterationsSoFar() {
		return this._iterationsSoFar;
	}

	_period = 0;
	get period() {
		return this._period;
	}

	/**
	 * Iterations per second
	 */
	_rate = NaN;
	get rate() {
		return this._rate;
	}
	set rate(/** @type {number} */value) {
		this._rate = value;
		this._period = msPerSecond / this._rate;
	}

	/**
	 * @type {((...args: any) => void) | undefined}
	 */
	_resolve = undefined;

	/**
	 * @type {LoopStatus}
	 */
	_status = `unstarted`;
	get status() {
		return this._status;
	}

	/**
	 * @param {FPSLoop['doWhat']} doWhat
	 * @param {object} [options]
	 * @param {FPSLoop['duration']} [options.duration=Infinity]
	 * @param {FPSLoop['rate']} [options.rate] - Iterations per second
	 */
	constructor(doWhat, options = {}) {
		super();
		this.doWhat = doWhat;
		this.duration = options.duration ?? Infinity;
		this.rate = options.rate ?? 0;
	}

	end() {
		this.pause(true);
		this._status = `ended`;

		if (this._resolve) {
			this._resolve();
		}

		return this;
	}

	/**
	 * @override
	 * @returns {this}
	 */
	restart() {
		super.restart();

		this._ending = new Promise(resolve => {
			this._resolve = resolve;
		});
		this._iterationsSoFar = 0;

		let elapsedExpected = -1;
		const step = () => {
			if (this.status !== `started`) {
				return;
			}

			if (this.paused === false) {
				const elapsedActual = this.elapsed;

				if (elapsedActual >= this.duration) {
					this.end();
					return;
				}

				if (
					this.rate > 0
					&& elapsedActual >= elapsedExpected
				) {
					elapsedExpected += this._period;
					this.doWhat();
					this._iterationsSoFar += 1;
				}
			}

			setImmediate(step);
		};

		this._status = `started`;
		step();

		return this;
	}
}
