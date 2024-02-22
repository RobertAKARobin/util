import { appContext } from './context.ts';
export type LoopState =
	| `ended`
	| `paused`
	| `running`
	| `unstarted`;

/**
 * Loops over the given callback at the given number of iterations/frames per second.
 */
export class FPSLoop {
	get currentLoop() {
		return this.currentLoop_;
	}
	private currentLoop_?: Promise<void>;
	doWhat: () => void;
	loopsPerSecond: number;
	private resolve_?: Function;
	runner: typeof requestAnimationFrame | typeof setImmediate;
	get state() {
		return this.state_;
	}
	private state_: LoopState = `unstarted`;

	constructor(
		doWhat: FPSLoop[`doWhat`],
		options: Partial<{
			framesPerSecond: number;
			runner: `requestAnimationFrame` | `setImmediate`;
		}> = {}
	) {
		this.doWhat = doWhat;
		this.loopsPerSecond = options.framesPerSecond ?? 60;

		const runner = options.runner ?? (
			appContext === `browser` ? `requestAnimationFrame` : `setImmediate`
		);
		this.runner = runner === `requestAnimationFrame`
			? globalThis.requestAnimationFrame.bind(globalThis) // Throws "Illegal invocation" if `this` not `null` or `window`
			: globalThis.setImmediate;
	}

	begin(): Promise<void> {
		this.currentLoop_ = new Promise(resolve => {
			this.resolve_ = resolve;
		});
		this.state_ = `running`;

		const period = 1000 / this.loopsPerSecond;

		let timeNextLoop_ = 0;
		const step = () => {
			const time = performance.now();
			if (time >= timeNextLoop_) {
				timeNextLoop_ = time + period;
				if (this.state === `running`) {
					this.doWhat();
				}
			}

			if (this.state === `paused` || this.state === `running`) {
				this.runner(step);
			}
		};

		void step();

		return this.currentLoop ?? Promise.resolve();
	}

	pause() {
		this.state_ = `paused`;
		return this;
	}

	resolve() {
		this.state_ = `ended`;
		this.resolve_!();
		return this;
	}

	unpause() {
		if (this.state_ !== `paused`) {
			throw new Error(`Cannot unpause; current state is '${this.state_}'`);
		}
		this.state_ = `running`;
		return this;
	}
}
