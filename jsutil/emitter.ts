type OnEmit<Type> = (value: Type, subscription: Subscription<Type>) => unknown;

type Subscription<Type> = WeakRef<OnEmit<Type>>;

export class Emitter<Type> {
	/** @see {@link EmitterCache} */
	readonly cache: EmitterCache<Type>;

	get last() {
		return this.cache?.list?.[0];
	}

	/** A collection of all active subcriptions to this Emitter. */
	readonly subscriptions = new Set<Subscription<Type>>;

	constructor(options: Partial<EmitterOptions> = {}) {
		this.cache = new EmitterCache<Type>(options.cache ?? {});
	}

	next(value: Type): void {
		this.cache.add(value);
		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription.deref();
			if (onEmit) {
				onEmit(value, subscription);
			} else {
				this.subscriptions.delete(subscription);
			}
		}
	}

	subscribe(onEmit: OnEmit<Type>): WeakRef<OnEmit<Type>> {
		const subscription = new WeakRef(onEmit);
		this.subscriptions.add(subscription);
		return subscription;
	}

	unsubscribe(subscription: WeakRef<OnEmit<Type>>): void {
		this.subscriptions.delete(subscription);
	}

	unsubscribeAll(): void {
		this.subscriptions.clear();
	}
}

/** Encloses an array of values in reverse insertion order. */
export class EmitterCache<Type> {
	/** The quantity of values to cache. */
	limit: number;

	get list(): Array<Type> {
		return [...this.memory];
	}

	private readonly memory: Array<Type> = [];

	constructor(options: Partial<EmitterCacheOptions> = {}) {
		this.limit = options.limit ?? EmitterCacheOptionsDefault.limit;
	}

	add(value: Type): void {
		return this.addMany([value]);
	}

	addMany(values: Array<Type>): void {
		if (this.limit <= 0) {
			return;
		}
		this.memory.unshift(...values);
		this.memory.splice(this.limit);
	}
}

export type EmitterCacheOptions = typeof EmitterCacheOptionsDefault;

export const EmitterCacheOptionsDefault = {
	limit: 1,
};

export interface EmitterOptions {
	cache: Partial<EmitterCacheOptions>;
}
