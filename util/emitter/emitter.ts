import { isPrimitive } from '../isPrimitive.ts';

export type EmitterOptions<State> = EmitterCacheOptions & {
	emitOnInit: boolean;
	reduce: Emitter<State>[`reducer`];
	reset: Emitter<State>[`resetter`];
};

export type EmitEvent<State> = [
	State,
	{
		emitter: Emitter<State>;
		previous: State;
	},
];

export const IGNORE = `_IGNORE_` as const;

export type PipeFunction<StateInput, StateOutput> = (
	...event: SubscriptionEvent<StateInput>
) => StateOutput | typeof IGNORE;

export type Subscription<State> = {
	emitter: WeakRef<Emitter<State>>;
	unsubscribe: () => void;
};

export type SubscriptionEvent<State> = [
	State,
	{
		emitter: Emitter<State>;
		handler: SubscriptionHandler<State>;
		previous: State;
	},
];

export type SubscriptionHandler<State> = (...event: SubscriptionEvent<State>) => void;

export class Emitter<State> extends EventTarget {

	get $() {
		return this.value;
	}
	readonly cache: EmitterCache<State>;
	readonly handlers = new Set<SubscriptionHandler<State>>();
	get last() {
		return this.cache.list[0];
	}
	onUnsubscribe?: () => void;
	reducer?: (...event: EmitEvent<State>) => State;
	resetter?: () => State;
	get value() {
		return this.last;
	}

	constructor(
		initial?: State | null | undefined,
		options: Partial<EmitterOptions<State>> = {}
	) {
		super();
		this.cache = new EmitterCache(options ?? {});
		if (initial !== undefined && initial !== null) {
			if (options.emitOnInit === true) {
				this.set(initial);
			} else {
				this.cache.add(initial);
			}
		}
		this.reducer = options.reduce;
		this.resetter = options.reset;
	}

	patch(update: Partial<State> | State) {
		if (isPrimitive(update)) {
			return this.set(update as State);
		}
		return this.set({
			...this.value,
			...update as Partial<State>,
		});
	}

	pipe<Output>(pipeFunction: PipeFunction<State, Output>) {
		const innerEmitter = new Emitter<Output>();

		const innerSubscription = this.subscribe((event, meta) => {
			const result = pipeFunction(event, meta);
			innerEmitter.set(result);
		});

		innerEmitter.onUnsubscribe = () => {
			if (innerEmitter.handlers.size === 0) {
				innerSubscription.unsubscribe();
			}
		};

		return innerEmitter;
	}

	reset() {
		if (this.resetter) {
			this.set(this.resetter());
		}
		return this;
	}

	set(update: State | typeof IGNORE) {
		const previous = this.value;

		if (update === IGNORE) { // Need a way to indicate that an event _shouldn't_ emit. Can't just do `value === undefined` because there are times when `undefined` is a value we do want to emit
			return this;
		}

		const value = typeof this.reducer === `function`
			? this.reducer(update, {
				emitter: this,
				previous,
			})
			: update;

		this.cache.add(value);

		for (const handler of this.handlers) {
			handler(value, {
				emitter: this,
				handler,
				previous,
			});
		}

		return this;
	}

	subscribe(handler: SubscriptionHandler<State>): Subscription<State> {
		this.handlers.add(handler);
		return {
			emitter: new WeakRef(this),
			unsubscribe: () => this.unsubscribe(handler),
		};
	}

	unsubscribe(handler: SubscriptionHandler<State>) {
		this.handlers.delete(handler);
		if (typeof this.onUnsubscribe === `function`) {
			this.onUnsubscribe();
		}
		return this;
	}

	unsubscribeAll() {
		for (const handler of this.handlers) {
			this.unsubscribe(handler);
		}
		return this;
	}
}

/** Encloses an array of values in reverse insertion order. */
export class EmitterCache<State> {
	/** The quantity of values to cache. */
	limit: number;

	get list(): Array<State> {
		return [...this.memory];
	}

	private readonly memory: Array<State> = [];

	constructor(options: Partial<EmitterCacheOptions> = {}) {
		this.limit = options.limit ?? emitterCacheOptionsDefault.limit;
	}

	add(value: State) {
		return this.addMany([value]);
	}

	addMany(entries: Array<State>) {
		if (this.limit <= 0) {
			return;
		}
		for (const entry of entries) {
			this.memory.unshift(entry);
		}
		this.memory.splice(this.limit);
		return this;
	}
}

export const emitterCacheOptionsDefault = {
	limit: 1,
};

export type EmitterCacheOptions = typeof emitterCacheOptionsDefault;
