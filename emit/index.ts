export class Emitter<Type> {
	/** A collection of all active subscriptions to all Emitters. Used to debug memory management. */
	static readonly subscriptions = new Set<Subscription<any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any

	/** @see {@link EmitterCache} */
	readonly cache: EmitterCache<Type>;

	/** A collection of all active subcriptions to this Emitter. */
	readonly subscriptions = new Set<Subscription<Type>>();

	constructor(options: Partial<EmitterOptions> = {}) {
		this.cache = new EmitterCache<Type>(options.cache ?? {});
	}

	next(value: Type): Emitter<Type> {
		this.cache.add(value);
		for (const subscription of this.subscriptions) {
			subscription.onEmit?.(value);
		}
		return this;
	}

	subscribe(onEvent?: Subscription<Type>[`onEmit`]): Subscription<Type> {
		const subscription = new Subscription<Type>(this, onEvent);
		Emitter.subscriptions.add(subscription);
		this.subscriptions.add(subscription);
		return subscription;
	}

	unsubscribe(subscription: Subscription<Type>): void {
		Emitter.subscriptions.delete(subscription);
		this.subscriptions.delete(subscription);
	}

	unsubscribeAll(): void {
		this.subscriptions.forEach(Emitter.subscriptions.delete); // eslint-disable-line @typescript-eslint/unbound-method
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

export class Subscription<Type> {
	constructor(
		readonly emitter: Emitter<Type>,
		public onEmit?: (value: Type) => unknown,
	) {}

	destroy(): void {
		this.emitter.unsubscribe(this);
	}
}
