import { isPrimitive } from '../isPrimitive.ts';

export type EmitterOptions<State> = EmitterCacheOptions & {
	emitOnInit: boolean;
	formatter: Emitter<State>[`formatter`];
	reset: Emitter<State>[`resetter`];
};

export type EmitEvent<State> = [
	State,
	{
		emitter: Emitter<State>;
		previous: State;
	},
];

export const IGNORE = `_IGNORE_`;

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

export class Emitter<State> {
	static fromEvent<
		EventName extends keyof HTMLElementEventMap,
		EventType extends HTMLElementEventMap[EventName],
	>(target: EventTarget, eventName: EventName) {
		const emitter = new Emitter<EventType>();

		const listener = (event: Event) => {
			emitter.set(event as EventType);
		};
		target.addEventListener(eventName, listener);

		emitter.onUnsubscribe = () => {
			target.removeEventListener(eventName, listener);
		};

		return emitter;
	}

	static fromPromise<State>(
		promise: Promise<State>,
		...args: ConstructorParameters<typeof Emitter<State>>
	) {
		const emitter = new Emitter<State>(...args);

		void promise.then(result => {
			emitter.set(result);
		});

		return emitter;
	}

	get $() {
		return this.value;
	}
	readonly cache: EmitterCache<State>;
	formatter?: (...event: EmitEvent<State>) => State;
	readonly handlers = new Set<SubscriptionHandler<State>>();
	get last() {
		return this.cache.list[0];
	}
	onUnsubscribe?: () => void;
	resetter?: () => State;
	get value() {
		return this.last;
	}

	constructor(
		initial?: State | null | undefined,
		options: Partial<EmitterOptions<State>> = {},
	) {
		this.cache = new EmitterCache(options ?? {});
		if (initial !== undefined && initial !== null) {
			if (options.emitOnInit === true) {
				this.set(initial);
			} else {
				this.cache.add(initial);
			}
		}
		this.formatter = options.formatter;
		this.resetter = options.reset;
	}

	/**
	 * If the Emitter's value is an object, updates the object with the input partial object
	 */
	patch(update: Partial<State> | State) {
		if (isPrimitive(update)) {
			return this.set(update as State);
		}
		return this.set({
			...this.value,
			...update as Partial<State>,
		});
	}

	/**
	 * "Pipes" this Emitter's values into a new Emitter, first applying the supplies transformation
	 */
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

	/**
	 * Resets the Emitter's value to its initial state, if a `reset` function was supplied
	 */
	reset() {
		if (this.resetter) {
			this.set(this.resetter());
		}
		return this;
	}

	/**
	 * Sets the Emitter's value
	 */
	set(update: State | typeof IGNORE) {
		const previous = this.value;

		if (update === IGNORE) { // Need a way to indicate that an event _shouldn't_ emit. Can't just do `value === undefined` because there are times when `undefined` is a value we do want to emit
			return this;
		}

		const value = typeof this.formatter === `function`
			? this.formatter(update, {
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

	/**
	 * Returns a promise that resolves the next time the Emitter receives a value
	 * @param options.resolveIfHasValue If true, will resolve the promise if the Emitter already has any value. Defaults to false
	 */
	toPromise(options: {
		resolveIfHasValue?: boolean;
	} = {}) {
		const resolveIfHasValue = options.resolveIfHasValue ?? false;
		if (resolveIfHasValue && this.cache.count >= 1 && this.cache.limit > 0) {
			return Promise.resolve(this.value);
		}

		return new Promise<State>(resolve => {
			const subscription = this.subscribe(state => {
				subscription.unsubscribe();
				resolve(state);
			});
		});
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
	/** The number of values that have been set in this cache, regardless of its limit */
	get count() {
		return this.count_;
	}
	private count_ = 0;

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
		for (const entry of entries) {
			this.memory.unshift(entry);
			this.count_ += 1;
		}
		this.memory.splice(this.limit);
		return this;
	}
}

export const emitterCacheOptionsDefault = {
	limit: 1,
};

export type EmitterCacheOptions = typeof emitterCacheOptionsDefault;
