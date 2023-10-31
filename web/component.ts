import { type FunctionCache, functionCache } from './lib/function-cache.ts';

import type * as Type from './types.d.ts';
import { routerContext } from './router.ts';

declare let window: Window & FunctionCache<typeof cacheKey>;

const cacheKey = `fn` as const;
export const bind = routerContext === `client`
	? functionCache(cacheKey, { binding: window })
	: functionCache(cacheKey);

const componentStyleCache = new WeakMap<Type.Component, HTMLStyleElement>();
export const component = <
	TemplateArgs extends Type.Args
>(input: Type.Component<TemplateArgs>) => {
	if (routerContext === `client`) {
		if (input.style && !componentStyleCache.has(input as Type.Component)) {
			const $style = document.createElement(`style`); // TODO2: Scoped styles?
			$style.textContent = input.style;
			document.head.appendChild($style);
			componentStyleCache.set(input as Type.Component, $style);
		}
	}

	return (...args: TemplateArgs) => {
		return input.template(...args);
	};
};

export const toAttributes = (input: Record<string, string>) =>
	Object.entries(input)
		.map(([key, value]) => `${key}="${value}"`)
		.join(` `);
