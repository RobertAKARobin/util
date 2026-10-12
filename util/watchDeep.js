const isProxied = new WeakMap();

/**
 * @template {object} Input
 * @typedef {{
 * property: PropertyKey,
 * target: unknown,
 * value: unknown,
 * }} WatchDeepGet
 */

/**
 * @template {object} Input
 * @typedef {WatchDeepGet<Input> & {
 * valueOld: unknown
 * }} WatchDeepSet
 */

/**
 * TODO1
 * @template {object} Input
 * @param {Input} input
 * @param {object} options
 * @param {(params: {property: PropertyKey, target: unknown, value: unknown}) => unknown} [options.onGet]
 * @param {(params: {property: PropertyKey, target: unknown, value: unknown, valueOld: unknown}) => unknown} [options.onSet]
 * @returns {Input}
 */
export function watchDeep(input, options) {
	if (isProxied.has(input)) {
		return isProxied.get(input); // eslint-disable-line @typescript-eslint/no-unsafe-return
	}

	const onGet = options.onGet ?? (({ value }) => value);
	const onSet = options.onSet ?? (({ value }) => value);
	const proxy = new Proxy(input, {
		get(target, property) {
			const value = target[/** @type {keyof Input} */(property)];

			if (typeof value === `object` && value !== null) {
				return onGet({ property, target, value: watchDeep(value, options) });
			}

			return onGet({ property, target, value });
		},

		set(target, _property, value) {
			const property = /** @type {keyof Input} */(_property);
			const valueOld = target[property];

			if (value !== valueOld) {
				target[property] = /** @type {Input[keyof Input]} */(
					onSet({ property, target, value, valueOld })
				);
			}

			return true;
		},
	});

	isProxied.set(input, proxy);
	return proxy;
}
