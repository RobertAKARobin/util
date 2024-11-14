import { enumy } from '../group/enumy.ts';
import { preciseTo } from '../math/preciseTo.ts';
import { setImmediate } from './setImmediate.ts';

export const loopStatuses = [
	`unstarted`,
	`starting`,
	`started`,
	`ending`,
	`ended`,
] as const;

export const loopStatus = enumy(...loopStatuses);

export type LoopStatus = typeof loopStatuses[number];

const msPerSecond = 1000;

/**
 * Loops over the given callback at the given number of iterations/frames per second.
 */
export class FPSLoop {
	get currentLoop() {
		return this.currentLoop_;
	}
	private currentLoop_?: Promise<void>;

	doWhat: () => void;

	duration: number;

	get isPaused() {
		return this.isPaused_;
	}
	private isPaused_ = false;

	loopsPerSecond?: number;

	private resolve_?: Function;

	get status() {
		return this.status_;
	}
	private set status(value: LoopStatus) {
		this.status_ = value;
	}
	private status_: LoopStatus = `unstarted`;

	get timeElapsed() {
		return this.timeElapsed_;
	}
	private timeElapsed_ = 0;

	get timeStarted() {
		return this.timeStarted_;
	}
	private timeStarted_ = 0;

	constructor(
		doWhat: FPSLoop[`doWhat`],
		options: Partial<{
			duration: FPSLoop[`duration`];
			loopsPerSecond: FPSLoop[`loopsPerSecond`];
		}> = {},
	) {
		this.doWhat = doWhat;
		this.duration = options.duration ?? Infinity;
		this.loopsPerSecond = options.loopsPerSecond;
	}

	end() {
		this.status_ = `ending`;
		this.resolve_!();
		this.status_ = `ended`;
		return this;
	}

	pause() {
		this.isPaused_ = true;
		return this;
	}

	start(): Promise<void> {
		this.currentLoop_ = new Promise(resolve => {
			this.resolve_ = resolve;
		});
		this.status_ = `starting`;
		this.timeStarted_ = preciseTo(performance.now());
		this.timeElapsed_ = 0;

		const period = typeof this.loopsPerSecond === `number`
			? msPerSecond / this.loopsPerSecond
			: 0;

		let timeNextLoop = 0;
		const step = () => {
			if (this.isPaused) {
				return;
			}

			const timeNow = preciseTo(performance.now());
			this.timeElapsed_ = timeNow - this.timeStarted;

			if (timeNow >= timeNextLoop) {
				timeNextLoop = timeNow + period;
				if (this.status === `started`) {
					this.doWhat();

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
