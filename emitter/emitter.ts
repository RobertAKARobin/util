import { isPrimitive } from '../isPrimitive.ts';

export type Formatter<
	State,
	Source extends Emitter<State> = Emitter<State>,
> = (
	value: State,
	meta: {
		emitter: Source;
		previous: State;
	}
) => State;

export type OnEmit<
	State,
	Source extends Emitter<State> = Emitter<State>,
> = (
	value: State,
	meta: {
		emitter: Source;
		previous: State;
		subscription: Subscription<State, Source>;
	}
) => unknown;

export type Subscription<
	State,
	Source extends Emitter<State> = Emitter<State>,
> = OnEmit<State, Source> | WeakRef<OnEmit<State, Source>>;

export type EmitterOptions<State> = EmitterCacheOptions & {
	emitOnInit: boolean;
	format: Formatter<State>;
	reset: () => State;
};

const IGNORE = `_IGNORE_` as const;

// TODO1: Operators: filter, startWith, once, toPromise
export class Emitter<State> {

	get $() {
		return this.value;
	}
	readonly cache: EmitterCache<State>;
	formatter?: Formatter<State>;
	get last() {
		return this.cache.list[0];
	}
	resetter?: () => State;
	readonly subscriptions = new Set<Subscription<State>>();
	get value() {
		return this.last;
	}

	constructor(
		initial?: State | null | undefined,
		options: Partial<EmitterOptions<State>> = {}
	) {
		this.cache = new EmitterCache(options ?? {});
		if (initial !== undefined && initial !== null) {
			if (options.emitOnInit === true) {
				this.set(initial);
			} else {
				this.cache.add(initial);
			}
		}
		this.formatter = options.format;
		this.resetter = options.reset;
	}

	filter(filter: (updated: State, previous: State) => boolean) {
		return this.pipe((state, { previous }) => {
			if (filter(state, previous)) {
				return state;
			}
			return IGNORE as unknown as State;
		});
	}

	on<PropertyName extends keyof State>(
		property: PropertyName | ((state: State) => State[PropertyName]),
	) {
		const getValue = typeof property === `function`
			? property
			: (state: State) => state[property];
		return this.pipe((state, { previous }) => {
			if (getValue(state) === getValue(previous)) {
				return IGNORE as unknown as State;
			}
			return state;
		});
	}

	onChange(
		_update: State,
		_meta: Omit<Parameters<OnEmit<State>>[1], `subscription`>
	) {}

	patch(update: Partial<State> | State) {
		if (isPrimitive(update)) {
			return this.set(update as State);
		}
		return this.set({
			...this.value,
			...update as Partial<State>,
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
			return emitter.set(value);
		});
		return emitter;
	}

	reset() {
		if (this.resetter) {
			this.set(this.resetter());
		}
		return this;
	}

	set(update: State) {
		const previous = this.value;
		const meta = {
			emitter: this,
			previous,
		};

		const formatted = this.formatter === undefined
			? update
			: this.formatter(update, meta);

		if (update === IGNORE) { // Need a way to indicate that an event _shouldn't_ emit. Can't just do `value === undefined` because there are times when `undefined` is a value we do want to emit
			return this;
		}

		this.cache.add(formatted);

		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription instanceof WeakRef
				? subscription.deref()
				: subscription;
			if (onEmit) {
				const update = this.value;
				onEmit(update, {
					...meta,
					subscription,
				});
			} else {
				console.warn(`Subscription dead`);
				this.subscriptions.delete(subscription);
			}
		}
		this.onChange(this.value, meta);

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
	) {
		const isStrong = options?.isStrong ?? true; // TODO1: Make weak by default
		const subscription = isStrong
			? onEmit
			: new WeakRef(onEmit);
		this.subscriptions.add(subscription);

		return () => {
			this.unsubscribe(subscription);
			return this;
		};
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
