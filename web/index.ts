import { Emitter } from '@robertakarobin/emit/index.ts';

import { type FunctionCache, functionCache } from './lib/function-cache.ts';

import type * as Type from './types.d.ts';

export const routerContexts = [
	`client`,
	`static`,
] as const;

export const routerContext: Type.RouterContext = typeof window !== `undefined`
	? `client`
	: `static`;

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

class Router__Client extends Emitter<string> {
	constructor() {
		super({
			cache: {
				limit: 1,
			},
		});

		window.onpopstate = window.onload = this.onChange.bind(this);
	}

	onChange() {
		const newPath = window.location.pathname;
		if (newPath !== this.last) {
			this.next(newPath);
		}
	}
}

class Router__Static extends Emitter<string> {}

export const router = routerContext === `client`
	? new Router__Client()
	: new Router__Static();

export const toAttributes = (input: Record<string, string>) =>
	Object.entries(input)
		.map(([key, value]) => `${key}="${value}"`)
		.join(` `);
