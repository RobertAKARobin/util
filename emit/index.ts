export interface CfCacheOptions<Type> { // eslint-disable-line @typescript-eslint/no-unused-vars
	limit: number;
}

export const CfCacheOptionsDefault: CfCacheOptions<unknown> = {
	limit: 1,
};

/** Encloses an array of values in reverse insertion order. */
export class CfCache<Type> {
	private readonly _memory: Array<Type> = [];

	/** The quantity of values to cache. */
	limit: number;

	get list(): Array<Type> {
		return [...this._memory];
	}

	constructor(options: Partial<CfCacheOptions<Type>> = {}) {
		this.limit = options.limit ?? CfCacheOptionsDefault.limit;
	}

	add(value: Type): void {
		return this.addMany([value]);
	}

	addMany(values: Array<Type>): void {
		if (this.limit <= 0) {
			return;
		}
		this._memory.unshift(...values);
		this._memory.splice(this.limit);
	}
}

export interface CfEmitterOptions<Type> {
	cache: Partial<CfCacheOptions<Type>>;
}

export class CfEmitter<Type> {
	/** A collection of all active subscriptions to all CfEmitters. Used to debug memory management. */
	static readonly subscriptions = new Set<CfSubscription<any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any

	/** @see {@link CfCache} */
	readonly cache: CfCache<Type>;

	/** A collection of all active subcriptions to this CfEmitter. */
	readonly subscriptions = new Set<CfSubscription<Type>>();

	constructor(options: Partial<CfEmitterOptions<Type>> = {}) {
		this.cache = new CfCache<Type>(options.cache ?? {});
	}

	next(value: Type): void {
		this.cache.add(value);
		for (const subscription of this.subscriptions) {
			subscription.onEmit?.(value);
		}
	}

	subscribe(onEvent?: CfSubscription<Type>[`onEmit`]): CfSubscription<Type> {
		const subscription = new CfSubscription<Type>(this, onEvent);
		CfEmitter.subscriptions.add(subscription);
		this.subscriptions.add(subscription);
		return subscription;
	}

	unsubscribe(subscription: CfSubscription<Type>): void {
		CfEmitter.subscriptions.delete(subscription);
		this.subscriptions.delete(subscription);
	}

	unsubscribeAll(): void {
		this.subscriptions.forEach(CfEmitter.subscriptions.delete); // eslint-disable-line @typescript-eslint/unbound-method
		this.subscriptions.clear();
	}
}

export class CfSubscription<Type = unknown> {
	constructor(
		readonly emitter: CfEmitter<Type>,
		public onEmit?: (value: Type) => unknown,
	) {}

	destroy(): void {
		this.emitter.unsubscribe(this);
	}
}
