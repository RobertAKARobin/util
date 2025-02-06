/**
 * @import { EmitEvent, EmitterCacheOptions, EmitterOptions, PipeFunction, Subscription, SubscriptionHandler } from './types.d';
 */

import { isPrimitive } from '../isPrimitive';

export const IGNORE = `_IGNORE_`;

/**
 * An object that emits observable values
 * @template State
 */
export class Emitter {
	/**
	 * Creates an Emitter that emits when the given target emits the given event
	 * @template {keyof HTMLElementEventMap} EventName
	 * @template {HTMLElementEventMap[EventName]} EventType
	 * @param {EventTarget} target
	 * @param {EventName} eventName
	 * @returns {Emitter<EventType>}
	 */
	static fromEvent(target, eventName) {
		const emitter = /** @type {Emitter<EventType>} */(new Emitter());

		const listener = /** @type {EventListener} */(
			(/** @type {EventType} */event) => {
				emitter.set(event);
			}
		);
		target.addEventListener(eventName, listener);

		emitter.onUnsubscribe = () => {
			target.removeEventListener(eventName, listener);
		};

		return emitter;
	}

	/**
	 * Creates an Emitter from the given Promise
	 * @template State
	 * @param {Promise<State>} promise
	 * @param {ConstructorParameters<typeof Emitter<State>>} args
	 * @returns {Emitter<State>}
	 */
	static fromPromise(promise, ...args) {
		const emitter = new Emitter(...args);

		void promise.then(result => {
			emitter.set(result);
		});

		return emitter;
	}

	/**
	 * Wrapper around `this.value`
	 * @returns {typeof this.value}
	 */
	get $() {
		return this.value;
	}
	/**
	 * A cache of the Emitter's past `n` values
	 * @type {EmitterCache<State>}
	 * @readonly
	 */
	cache;
	/**
	 * A callback that manipulates all data before it is emittted
	 * @type {undefined | ((...event: EmitEvent<State>) => State)}
	 */
	formatter;
	/**
	 * Stores all the subscriptions to this Emitter
	 * @readonly
	 */
	handlers = /** @type {Set<SubscriptionHandler<State>>} */(new Set());
	/**
	 * Returns the most recent value in the Emitter's cache
	 * @returns {State}
	 */
	get last() {
		return this.cache.list[0];
	}
	/**
	 * Callback that is run whenever the Emitter is unsubscribed
	 * @type {undefined | (() => void)}
	 */
	onUnsubscribe;
	/**
	 * Callback that is run whenever `this.reset()` is called
	 * @type {undefined | (() => State)}
	 */
	resetter;
	/**
	 * Returns the most recent value in the Emitter's cache
	 * @returns {State}
	 */
	get value() {
		return this.last;
	}

	/**
	 * @param {State} [initial] - The initial data to set as the Emitter's value
	 * @param {Partial<EmitterOptions<State>>} [options]
	 */
	constructor(
		initial,
		options = {},
	) {
		this.cache = new EmitterCache(options ?? {});
		if (initial !== undefined) {
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
	 * @param {Partial<State>} update
	 * @returns {this}
	 */
	patch(update) {
		if (isPrimitive(update)) {
			return this.set(/** @type {State} */(update));
		}
		return this.set({
			...(/** @type {State} */(this.value ?? {})),
			...(/** @type {Partial<State>} */(update)),
		});
	}

	/**
	 * "Pipes" this Emitter's values into a new Emitter, first applying the supplies transformation
	 * @template Output
	 * @param {PipeFunction<State, Output>} pipeFunction
	 * @returns {Emitter<Output>}
	 */
	pipe(pipeFunction) {
		const innerEmitter = /** @type {Emitter<Output>} */(new Emitter());

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
	 * @returns {this}
	 */
	reset() {
		if (this.resetter) {
			this.set(this.resetter());
		}
		return this;
	}

	/**
	 * Sets the Emitter's value
	 * @param {State | typeof IGNORE} update
	 * @returns {this}
	 */
	set(update) {
		const previous = /** @type {State} */(this.value);

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

	/**
	 * Subscribe to this Emitter, which means the provided handler is called whenever the emitter emits a value
	 * @param {SubscriptionHandler<State>} handler
	 * @returns {Subscription<State>}
	 */
	subscribe(handler) {
		this.handlers.add(handler);
		return {
			emitter: new WeakRef(this),
			unsubscribe: () => this.unsubscribe(handler),
		};
	}

	/**
	 * Returns a promise that resolves the next time the Emitter receives a value
	 * @param {object} [options]
	 * @param {boolean} [options.resolveIfHasValue=false] - If true, will resolve the promise if the Emitter already has any value. Defaults to false
	 * @returns {Promise<State>}
	 */
	toPromise(options = {}) {
		const resolveIfHasValue = options.resolveIfHasValue ?? false;
		if (resolveIfHasValue && this.cache.count >= 1 && this.cache.limit > 0) {
			return Promise.resolve(/** @type {State} */(this.value));
		}

		return new Promise(resolve => {
			const subscription = this.subscribe(state => {
				subscription.unsubscribe();
				resolve(state);
			});
		});
	}

	/**
	 * Deactivate the given handler
	 * @param {SubscriptionHandler<State>} handler
	 * @returns {this}
	 */
	unsubscribe(handler) {
		this.handlers.delete(handler);
		if (typeof this.onUnsubscribe === `function`) {
			this.onUnsubscribe();
		}
		return this;
	}

	/**
	 * Unsubscribe all subscriptions
	 * @returns {this}
	 * @see unsubscribe
	 */
	unsubscribeAll() {
		for (const handler of this.handlers) {
			this.unsubscribe(handler);
		}
		return this;
	}
}

/**
 * Encloses an array of values in reverse insertion order.
 * @template State
 */
export class EmitterCache {
	/**
	 * The number of values that have been set in this cache, regardless of its limit
	 * @returns {number}
	 */
	get count() {
		return this.count_;
	}
	/**
	 * @private
	 */
	count_ = 0;

	/**
	 * The quantity of values to cache.
	 * @type {number}
	 */
	limit;

	/**
	 * Returns a list of all values in the cache
	 * @returns {Array<State>}
	 */
	get list() {
		return [...this.memory];
	}

	/**
	 * The cached values
	 * @type {Array<State>}
	 * @readonly
	 * @private
	 */
	memory = [];

	/**
	 * asdf
	 * @param {EmitterCacheOptions} [options]
	 */
	constructor(options = {}) {
		this.limit = options.limit ?? emitterCacheOptionsDefault.limit;
	}

	/**
	 * Appends a value to the cache
	 * @param {State} value
	 * @ignore
	 */
	add(value) {
		return this.addMany([value]);
	}

	/**
	 * Appends many values to the cache
	 * @param {Array<State>} entries
	 * @returns {this}
	 */
	addMany(entries) {
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
