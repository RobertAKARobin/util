import { enumy } from '../group/enumy';
import { setImmediate } from './setImmediate';

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
export class FPSLoop {
	get currentLoop() {
		return this.currentLoop_;
	}
	/**
	 * @type {Promise<void> | undefined}
	 * @private
	 */
	currentLoop_ = undefined;

	/**
	 * @type {() => void}
	 */
	doWhat;

	/**
	 * @type {number}
	 */
	duration;

	get isPaused() {
		return this.isPaused_;
	}
	/**
	 * @private
	 */
	isPaused_ = false;

	/**
	 * @type {number | undefined}
	 */
	loopsPerSecond = undefined;

	get loopsSoFar() {
		return this.loopsSoFar_;
	}
	/**
	 * @private
	 */
	loopsSoFar_ = 0;

	/**
	 * @type {(() => void) | undefined}
	 * @private
	 */
	resolve_ = undefined;

	get status() {
		return this.status_;
	}
	/**
	 * @param {LoopStatus} value
	 * @private
	 */
	set status(value) {
		this.status_ = value;
	}
	/**
	 * @type {LoopStatus}
	 */
	status_ = `unstarted`;

	get timeElapsed() {
		return this.timeElapsed_;
	}
	/**
	 * @private
	 */
	timeElapsed_ = 0;

	get timeStarted() {
		return this.timeStarted_;
	}
	/**
	 * @private
	 */
	timeStarted_ = 0;

	/**
	 * @param {FPSLoop['doWhat']} doWhat
	 * @param {object} [options]
	 * @param {FPSLoop['duration']} [options.duration=Infinity]
	 * @param {FPSLoop['loopsPerSecond']} [options.loopsPerSecond]
	 */
	constructor(doWhat, options = {}) {
		this.doWhat = doWhat;
		this.duration = options.duration ?? Infinity;
		this.loopsPerSecond = options.loopsPerSecond;
	}

	end() {
		if (this.resolve_) {
			this.status_ = `ending`;
			this.resolve_();
		}

		this.status_ = `ended`;
		return this;
	}

	pause() {
		this.isPaused_ = true;
		return this;
	}

	start() {
		this.currentLoop_ = new Promise(resolve => {
			this.resolve_ = resolve;
		});
		this.status_ = `starting`;
		this.timeStarted_ = performance.now();
		this.timeElapsed_ = 0;
		this.loopsSoFar_ = 0;

		let timeElapsedNextLoop = -1;
		const step = () => {
			if (this.isPaused) {
				return;
			}

			this.timeElapsed_ = performance.now() - this.timeStarted;

			if (this.timeElapsed_ >= timeElapsedNextLoop) {
				const period = typeof this.loopsPerSecond === `number`
					? msPerSecond / this.loopsPerSecond
					: 0;
				timeElapsedNextLoop = timeElapsedNextLoop + period;

				if (this.status === `started`) {
					this.doWhat();
					this.loopsSoFar_ += 1;

					if (this.timeElapsed > this.duration) {
						this.end();
					}
				}
			}

			if (this.status === `started`) {
				setImmediate(step);
			}
		};

		this.status_ = `started`;
		step();

		return this.currentLoop_;
	}

	unpause() {
		this.isPaused_ = false;
		return this;
	}
}
