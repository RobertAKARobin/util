type OnEmit<State> = (
	value: State,
	previous: State,
	subscription: Subscription<State>
) => unknown;

type Subscription<State> = WeakRef<OnEmit<State>>;

export class Emitter<State> {
	/** @see {@link EmitterCache} */
	readonly cache: EmitterCache<State>;

	get last() {
		return this.cache?.list?.[0];
	}

	/** A collection of all active subcriptions to this Emitter. */
	readonly subscriptions = new Set<Subscription<State>>;

	constructor(options: Partial<EmitterCacheOptions<State>> = {}) {
		this.cache = new EmitterCache<State>(options ?? {});
	}

	next(value: State): void {
		const previous = this.last;
		this.cache.add(value);
		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription.deref();
			if (onEmit) {
				onEmit(value, previous, subscription);
			} else {
				this.subscriptions.delete(subscription);
			}
		}
	}

	pipe<Output>(callback: (state: State) => Output) {
		const emitter = new Emitter<Output>();
		this.subscribe(state => emitter.next(callback(state)));
		return emitter;
	}

	subscribe(onEmit: OnEmit<State>): WeakRef<OnEmit<State>> {
		const subscription = new WeakRef(onEmit);
		this.subscriptions.add(subscription);
		return subscription;
	}

	unsubscribe(subscription: WeakRef<OnEmit<State>>): void {
		this.subscriptions.delete(subscription);
	}

	unsubscribeAll(): void {
		this.subscriptions.clear();
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

	constructor(options: Partial<EmitterCacheOptions<State>> = {}) {
		this.limit = options.limit ?? EmitterCacheOptionsDefault.limit;
		if (`initial` in options) {
			this.add(options.initial!);
		}
	}

	add(value: State): void {
		return this.addMany([value]);
	}

	addMany(values: Array<State>): void {
		if (this.limit <= 0) {
			return;
		}
		this.memory.unshift(...values);
		this.memory.splice(this.limit);
	}
}

export type EmitterCacheOptions<State> = typeof EmitterCacheOptionsDefault & {
	initial: State;
};

export const EmitterCacheOptionsDefault = {
	limit: 1,
};
