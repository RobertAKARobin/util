const isProxied = new WeakMap();

/**
 * @template {object} Input
 * @typedef {object} WatchDeepReport
 * @property {PropertyKey} property - The name of the property being accessed
 * @property {unknown} target - The object containing the property being accessed
 * @property {unknown} value - The value of the property being accessed
 */

/**
 * TODO1
 * @template {object} Input
 * @param {Input} input
 * @param {object} options
 * @param {(report: WatchDeepReport<Input>) => unknown} [options.onGet]
 * @param {(report: WatchDeepReport<Input>) => unknown} [options.onSet]
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
				const subProxy = watchDeep(/** @type {Input} */(value), options);
				return onGet({ property, target, value: subProxy });
			}

			return onGet({ property, target, value });
		},

		set(target, _property, value) {
			const property = /** @type {keyof Input} */(_property);
			const valueOld = target[property];

			if (value !== valueOld) {
				target[property] = /** @type {Input[keyof Input]} */(
					onSet({ property, target, value })
				);
			}

			return true;
		},
	});

	isProxied.set(input, proxy);
	return proxy;
}
