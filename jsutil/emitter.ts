export type OnEmit<
	State extends Record<string, unknown>,
	Source extends Emitter<State> = Emitter<State>,
> = (
	value: State,
	meta: {
		action: string | undefined;
		emitter: Source;
		previous: State;
		subscription: Subscription<State, Source>;
		update: Partial<State>;
	}
) => unknown;

export type Subscription<
	State extends Record<string, unknown>,
	Source extends Emitter<State> = Emitter<State>,
> = WeakRef<OnEmit<State, Source>> | OnEmit<State, Source>;

type EmitterOptions = EmitterCacheOptions & {
	isReplace: boolean;
};

export class Emitter<
	State extends Record<string, unknown> = Record<string, unknown>,
	Actions extends Record<string, (...args: Array<any>) => Partial<State>> = any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
	readonly cache: EmitterCache<{
		action: string | undefined;
		update: Partial<State>;
	}>;
	/**
	 * If true, will overwrite the current value, instead of merging in the update. Important when the value is an object with methods, not just a dict.
	 */
	isReplace: boolean;
	readonly subscriptions = new Set<Subscription<State>>();
	value: State;

	constructor(
		initial?: State,
		actions = {} as Actions,
		options: Partial<EmitterOptions> = {}
	) {
		this.cache = new EmitterCache(options ?? {});
		this.isReplace = options.isReplace ?? false;
		this.value = initial as unknown as State; // Want value to possibly be undefined without needing to add null checks everywhere
		for (const actionName in actions) {
			const action = actions[actionName];
			const wrappedAction = (
				...args: Parameters<typeof action>
			) => this.set(action(...args), {
				action: actionName,
			});
			this.actions[actionName] = wrappedAction;
		}
	}

	pipe<Output extends Record<string, unknown>>(callback: (state: State) => Output) { // eslint-disable-line @typescript-eslint/no-explicit-any
		const initial = callback(this.$);
		const emitter = new Emitter<Output>(initial);
		this.subscribe(updatedState => emitter.set(callback(updatedState)));
		return emitter;
	}

	set(update: Partial<State>, options: Partial<{
		action: string;
		isReplace: boolean;
	}> = {}): this {
		this.cache.add({
			action: options?.action,
			update,
		});
		const previous = this.$;
		const updated = (this.isReplace || options?.isReplace === true)
			? update as State
			: { ...(this.$ ?? {}), ...update } as State;
		this.value = updated;
		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription instanceof WeakRef
				? subscription.deref()
				: subscription;
			if (onEmit) {
				onEmit(this.$, {
					action: options?.action,
					emitter: this,
					previous,
					subscription,
					update,
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
		this.subscriptions.add(options.isStrong === true
			? subscription
			: new WeakRef(subscription)
		);
		return subscription;

		/* emitter.update(emitter.actions.poo(32)); */
	}

	unsubscribe(subscription: WeakRef<OnEmit<State>> | OnEmit<State>) {
		this.subscriptions.delete(subscription);
		return this;
	}

	unsubscribeAll() {
		this.subscriptions.clear();
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

	addMany(values: Array<State>) {
		if (this.limit <= 0) {
			return;
		}
		this.memory.unshift(...values);
		this.memory.splice(this.limit);
		return this;
	}
}

export const emitterCacheOptionsDefault = {
	limit: 1,
};

export type EmitterCacheOptions = typeof emitterCacheOptionsDefault;
