export type OnEmit<
	State,
	Source extends Emitter<State> = Emitter<State>,
> = (
	value: State,
	meta: {
		emitter: Source;
		message: string | undefined;
		previous: State;
		subscription: Subscription<State, Source>;
	}
) => unknown;

export type Subscription<
	State,
	Source extends Emitter<State> = Emitter<State>,
> = WeakRef<OnEmit<State, Source>> | OnEmit<State, Source>;

type EmitterOptions = EmitterCacheOptions;

const IGNORE = `_IGNORE_` as const;

export class Emitter<
	State,
	Actions extends Record<string, (...args: Array<any>) => State> = any, // eslint-disable-line @typescript-eslint/no-explicit-any
> {
	get $() {
		return this.value;
	}
	readonly actions = {} as {
		[ActionName in keyof Actions]: (...args: Parameters<Actions[ActionName]>) => this;
	};
	/**
	 * A collection of all active subcriptions to this Emitter.
	 * @see {@link EmitterCache}
	 */
	readonly cache: EmitterCache<State>;
	get last() {
		return this.cache.list[this.cache.list.length - 1];
	}
	readonly subscriptions = new Set<Subscription<State>>();
	get value() {
		return this.last?.value;
	}

	constructor(
		initial?: State,
		actions = {} as Actions,
		options: Partial<EmitterOptions> = {}
	) {
		this.cache = new EmitterCache(options ?? {});
		if (initial !== undefined && initial !== null) {
			this.cache.add(initial);
		}
		for (const actionName in actions) {
			const action = actions[actionName];
			const wrappedAction = (
				...args: Parameters<typeof action>
			) => this.set(action(...args), actionName);
			this.actions[actionName] = wrappedAction;
		}
	}

	on(actionName: keyof Actions) {
		return this.pipe((update, meta) => {
			if (meta?.message !== actionName) {
				return IGNORE;
			}
			return update;
		});
	}

	pipe<Output>(
		callback: (
			value: Parameters<OnEmit<State>>[0],
			meta: Parameters<OnEmit<State>>[1]
		) => Output
	) {
		const emitter = new Emitter<Output>();
		this.subscribe((update, meta) => {
			const value = callback(update, meta);
			return emitter.set(value, meta.message);
		});
		return emitter;
	}

	set(value: State, message?: string): this {
		if (value === IGNORE) { // Need a way to indicate that an event _shouldn't_ emit. Can't just do `value === undefined` because there are times when `undefined` is a value we do want to emit
			return this;
		}
		this.cache.add(value, message);
		const previous = this.value;
		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription instanceof WeakRef
				? subscription.deref()
				: subscription;
			if (onEmit) {
				onEmit(this.value, {
					emitter: this,
					message,
					previous,
					subscription,
				});
			} else {
				console.warn(`Subscription dead`);
				this.subscriptions.delete(subscription);
			}
		}
		return this;
	}

	/**
	 * @param options.isStrong If false, will create a subscription that may be garbage-collected. Default false.
	 */
	subscribe(
		onEmit: OnEmit<State>,
		options: {
			isStrong?: boolean;
		} = {}
	): OnEmit<State> {
		const subscription = onEmit;
		const isStrong = options.isStrong ?? true;
		this.subscriptions.add(isStrong === true
			? subscription
			: new WeakRef(subscription)
		);
		return subscription;
	}

	unsubscribe(subscription: Subscription<State>) {
		this.subscriptions.delete(subscription);
		return this;
	}

	unsubscribeAll() {
		this.subscriptions.clear();
		return this;
	}
}

export type EmitterCacheEntry<State> = {
	message?: string;
	time: number;
	value: State;
};

/** Encloses an array of values in reverse insertion order. */
export class EmitterCache<State> {
	/** The quantity of values to cache. */
	limit: number;

	get list(): Array<EmitterCacheEntry<State>> {
		return [...this.memory];
	}

	private readonly memory: Array<EmitterCacheEntry<State>> = [];

	constructor(options: Partial<EmitterCacheOptions> = {}) {
		this.limit = options.limit ?? emitterCacheOptionsDefault.limit;
	}

	add(value: State, message?: string) {
		return this.addMany([{ message, value }]);
	}

	addMany(entries: Array<{
		message?: string;
		value: State;
	}>) {
		if (this.limit <= 0) {
			return;
		}
		for (const entry of entries) {
			this.memory.unshift({
				...entry,
				time: performance.now(),
			});
		}
		this.memory.splice(this.limit);
		return this;
	}
}

export const emitterCacheOptionsDefault = {
	limit: 1,
};

export type EmitterCacheOptions = typeof emitterCacheOptionsDefault;
