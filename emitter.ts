import { isPrimitive } from './isPrimitive.ts';

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
	actions = {} as Actions;
	readonly cache: EmitterCache<State>;
	get last() {
		return this.cache.list[this.cache.list.length - 1];
	}
	readonly subscriptions = new Set<Subscription<State>>();
	get value() {
		return this.last?.value;
	}

	constructor(
		initial?: State | undefined | null,
		options: Partial<EmitterOptions> = {}
	) {
		this.cache = new EmitterCache(options ?? {});
		if (initial !== undefined && initial !== null) {
			this.cache.add(initial);
		}
	}

	on(actionName: keyof this[`actions`]) {
		return this.pipe((value, meta) => {
			if (meta.message !== actionName) {
				return IGNORE;
			}
			return value;
		});
	}

	onChange(..._args: Parameters<OnEmit<State>>) {}

	patch(update: State | Partial<State>, message?: string) {
		if (isPrimitive(update)) {
			return this.set(update as State, message);
		}
		return this.set({
			...this.value,
			...update as Partial<State>,
		}, message);
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

	set(update: State, message?: string) {
		if (update === IGNORE) { // Need a way to indicate that an event _shouldn't_ emit. Can't just do `value === undefined` because there are times when `undefined` is a value we do want to emit
			return this;
		}
		const previous = this.value;
		this.cache.add(update, message);
		for (const subscription of this.subscriptions.values()) {
			const onEmit = subscription instanceof WeakRef
				? subscription.deref()
				: subscription;
			if (onEmit) {
				const meta = {
					emitter: this,
					message,
					previous,
					subscription,
				};
				const update = this.value;
				this.onChange(update, meta);
				onEmit(update, meta);
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
	) {
		const isStrong = options?.isStrong ?? true;
		const subscription = isStrong
			? onEmit
			: new WeakRef(onEmit);
		this.subscriptions.add(subscription);

		return () => {
			this.unsubscribe(subscription);
			return this;
		};
	}

	toActions<
		Input extends Record<keyof Actions, (...args: Array<any>) => State>, // eslint-disable-line @typescript-eslint/no-explicit-any
	>(input: Input) {
		const out = {} as {
			[Key in keyof Input]: (...args: Parameters<Input[Key]>) => this;
		};
		for (const actionName in input) {
			const action = input[actionName];
			out[actionName] = (
				...args: Parameters<typeof action>
			) => this.set(action(...args), actionName);
		}
		return out;
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
