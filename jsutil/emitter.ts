export type OnEmit<
	State extends object,
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
	State extends object,
	Source extends Emitter<State> = Emitter<State>,
> = WeakRef<OnEmit<State, Source>> | OnEmit<State, Source>;

export class Emitter<
	State extends object = Record<string, never>,
	Actions extends Record<string, (...args: Array<any>) => Partial<State>> = any, // eslint-disable-line @typescript-eslint/no-explicit-any
> {
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
	readonly subscriptions = new Set<Subscription<State, this>>;
	value: State;

	constructor(
		initial?: State,
		actions = {} as Actions,
		options: Partial<EmitterCacheOptions> = {}
	) {
		this.cache = new EmitterCache(options ?? {});
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

	pipe<Output extends object>(callback: (state: State) => Output) {
		const initial = callback(this.value);
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
		const previous = this.value;
		const updated = options?.isReplace === true
			? update as State
			: { ...(this.value ?? {}), ...update } as State;
		this.value = updated;
		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription instanceof WeakRef
				? subscription.deref()
				: subscription;
			if (onEmit) {
				onEmit(this.value, {
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
		onEmit: OnEmit<State, this>,
		options: {
			isStrong?: boolean;
		} = {}
	): OnEmit<State, this> {
		const subscription = onEmit;
		this.subscriptions.add(options.isStrong === true
			? subscription
			: new WeakRef(subscription)
		);
		return subscription;

		/* emitter.update(emitter.actions.poo(32)); */
	}

	unsubscribe(subscription: WeakRef<OnEmit<State, this>> | OnEmit<State, this>) {
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
