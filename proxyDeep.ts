/**
 * Creates an object that, when it or any of its properties/methods are cast to a string, returns the given placeholder.
 */
export function proxyDeep<Value>(placeholder: Value) {
	const handler = {
		get: (target: unknown, prop: string | symbol) => {
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
		while(true) {
			yield proxy;
		}
	}

	function asObject(): unknown {
		return proxy;
	}

	return asObject();
}
