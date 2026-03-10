import { enumy } from '../group/enumy.js';
import { setImmediate } from './setImmediate.js';
import { Timer } from './timer.js';

export const loopStatuses = /** @type {const} */([
	`unstarted`,
	`starting`,
	`started`,
	`ending`,
	`ended`,
]);

/**
 * @typedef {typeof loopStatuses[number]} LoopStatus
 */

export const loopStatus = enumy(...loopStatuses);

const msPerSecond = 1000;

/**
 * Loops over the given callback at the given number of iterations/frames per second.
 */
export class FPSLoop extends Timer {
	/**
	 * @type {Promise<void> | undefined}
	 */
	#currentLoop = undefined;
	get currentLoop() {
		return this.#currentLoop;
	}

	/**
	 * @type {() => void}
	 */
	doWhat;

	/**
	 * @type {number}
	 */
	duration;

	#loopsPerSecond = NaN;
	get loopsPerSecond() {
		return this.#loopsPerSecond;
	}
	set loopsPerSecond(/** @type {number} */value) {
		this.#loopsPerSecond = value;
		this.#period = msPerSecond / this.loopsPerSecond;
	}

	#loopsSoFar = 0;
	get loopsSoFar() {
		return this.#loopsSoFar;
	}

	#period = 0;

	/**
	 * @type {((...args: any) => void) | undefined}
	 */
	#resolve = undefined;

	/**
	 * @type {LoopStatus}
	 */
	#status = `unstarted`;
	get status() {
		return this.#status;
	}

	/**
	 * @param {FPSLoop['doWhat']} doWhat
	 * @param {object} [options]
	 * @param {FPSLoop['duration']} [options.duration=Infinity]
	 * @param {FPSLoop['loopsPerSecond']} [options.loopsPerSecond]
	 */
	constructor(doWhat, options = {}) {
		super();
		this.doWhat = doWhat;
		this.duration = options.duration ?? Infinity;
		this.loopsPerSecond = options.loopsPerSecond ?? 0;
	}

	end() {
		if (this.#resolve) {
			this.#status = `ending`;
			this.#resolve();
		}

		this.#status = `ended`;
		return this;
	}

	/**
	 * @override
	 * @returns {this}
	 */
	restart() {
		super.restart();

		this.#currentLoop = new Promise(resolve => {
			this.#resolve = resolve;
		});
		this.#status = `starting`;
		this.#loopsSoFar = 0;

		let timeElapsedNextLoop = -1;
		const step = () => {
			if (this.paused) {
				return;
			}

			const now = this.check();

			if (now >= timeElapsedNextLoop) {
				timeElapsedNextLoop += this.#period;

				if (this.status === `started`) {
					this.doWhat();
					this.#loopsSoFar += 1;

					if (now > this.duration) {
						this.end();
					}
				}
			}

			if (this.status === `started`) {
				setImmediate(step);
			}
		};

		this.#status = `started`;
		step();

		return this;
	}
}
