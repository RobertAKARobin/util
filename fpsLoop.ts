import { appContext } from './context.ts';
import { debounce } from './debounce.ts';
export type LoopState =
	| `unstarted`
	| `running`
	| `paused`
	| `ended`;

/**
 * Loops over the given callback at the given number of iterations/frames per second.
 */
export class FPSLoop {
	get currentLoop() {
		return this.currentLoop_;
	}
	private currentLoop_?: Promise<void>;
	doWhat: (loop: FPSLoop) => void;
	loopsPerSecond: number;
	private resolve_?: Function;
	runner: typeof setImmediate | typeof requestAnimationFrame;
	get state() {
		return this.state_;
	}
	private state_: LoopState = `unstarted`;

	constructor(
		doWhat: FPSLoop[`doWhat`],
		options: Partial<{
			loopsPerSecond: number;
			runner: `requestAnimationFrame` | `setImmediate`;
		}> = {}
	) {
		this.doWhat = doWhat;
		this.loopsPerSecond = options.loopsPerSecond ?? 60;

		const runner = options.runner ?? (
			appContext === `browser` ? `requestAnimationFrame` : `setImmediate`
		);
		this.runner = runner === `requestAnimationFrame`
			? globalThis.requestAnimationFrame
			: globalThis.setImmediate;
	}

	begin() {
		const period = 1000 / this.loopsPerSecond;
		this.currentLoop_ = new Promise(resolve => {
			this.resolve_ = resolve;
		});

		this.state_ = `running`;

		const step = debounce(() => {
			switch (this.state) {
				case `running`:
					this.doWhat(this);

				case `paused`:
				case `running`:
					this.runner(step);
			}
		}, period);

		step();

		return this.currentLoop;
	}

	pause() {
		this.state_ = `paused`;
		return this;
	}

	resolve() {
		this.state_ = `ended`;
		this.resolve_!();
	}

	unpause() {
		if (this.state_ !== `paused`) {
			throw new Error(`Cannot unpause; current state is '${this.state_}'`);
		}
		this.state_ = `running`;
	}
}
