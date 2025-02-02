/**
 * Creates an object that, when it or any of its properties/methods are cast to a string, returns the given placeholder.
 * Current use-case is, given a function that concats its params into a string, and a string that was produced by that function, we want to figure out which parts of the string were produced by which params. See Router.toUrl.
 * Note that when used with a spread operator it'll only return up to 10 values. Had to pick an upper bound because otherwise it caused an infinite loop.
 * @template Value
 * @param {Value} placeholder
 * @returns {Value}
 */
export function proxyDeep(placeholder) {
	const handler = {
		get: (
			/** @type {unknown} */_nil,
			/** @type {string | symbol} */propertyName,
		) => {
			if (propertyName === Symbol.toPrimitive) {
				return () => placeholder;
			}
			if (propertyName === Symbol.iterator) {
				return asArray;
			}

			return asObject();
		},
	};

	const proxy = new Proxy(asObject, handler);

	function* asArray() {
		let index = 0;
		while (index++ < 10) { // Is there a way to not specify an upper bound?
			yield proxy;
		}
	}

	function asObject() {
		return proxy;
	}

	return /** @type {Value} */(asObject());
}
