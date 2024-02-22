/**
 * Creates an object that, when it or any of its properties/methods are cast to a string, returns the given placeholder.
 * Note that when used with a spread operator it'll only return up to 10 values. Had to pick an upper bound because otherwise it caused an infinite loop.
 */
export function proxyDeep<Value>(placeholder: Value) {
	const handler = {
		get: (_target: unknown, prop: string | symbol) => {
			if (prop === Symbol.toPrimitive) {
				return () => placeholder;
			}
			if (prop === Symbol.iterator) {
				return asArray;
			}

			return asObject();
		},
	};

	const proxy = new Proxy(asObject, handler);

	function* asArray(): unknown {
		let index = 0;
		while (index++ < 10) { // Is there a way to not specify an upper bound?
			yield proxy;
		}
	}

	function asObject(): unknown {
		return proxy;
	}

	return asObject();
}
