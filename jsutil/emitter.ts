export type OnEmit<State> = (
	value: State,
	previous: State,
	subscription: Subscription<State>
) => unknown;

export type Subscription<State> = WeakRef<OnEmit<State>> | OnEmit<State>;

export type EmitterOptions<State> = EmitterCacheOptions & {
	initial: State;
};

export class Emitter<State> {
	/** @see {@link EmitterCache} */
	readonly cache: EmitterCache<State>;

	get last() {
		return this.cache?.list?.[0];
	}

	/** A collection of all active subcriptions to this Emitter. */
	readonly subscriptions = new Set<Subscription<State>>;

	constructor(options: Partial<EmitterOptions<State>> = {}) {
		this.cache = new EmitterCache<State>(options ?? {});
		if (options.initial !== undefined) {
			this.next(options.initial);
		}
	}

	next(value: State): void {
		const previous = this.last;
		this.cache.add(value);
		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription instanceof WeakRef
				? subscription.deref()
				: subscription;
			if (onEmit) {
				onEmit(value, previous, subscription);
			} else {
				this.subscriptions.delete(subscription);
			}
		}
	}

	pipe<Output>(callback: (state: State) => Output) {
		const emitter = new Emitter<Output>();
		emitter.next(callback(this.last));
		this.subscribe(state => emitter.next(callback(state)));
		return emitter;
	}

	/**
	 * @param options.strong If false, will create a subscription that may be garbage-collected. Default false.
	 */
	subscribe(
		onEmit: OnEmit<State>,
		options: {
			strong?: boolean;
		} = {}
	): OnEmit<State> {
		const subscription = onEmit;
		this.subscriptions.add(options.strong === true
			? subscription
			: new WeakRef(subscription)
		);
		return subscription;
	}

	unsubscribe(subscription: WeakRef<OnEmit<State>> | OnEmit<State>): void {
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

	constructor(options: Partial<EmitterCacheOptions> = {}) {
		this.limit = options.limit ?? emitterCacheOptionsDefault.limit;
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

export const emitterCacheOptionsDefault = {
	limit: 1,
};

export type EmitterCacheOptions = typeof emitterCacheOptionsDefault;
