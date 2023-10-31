import { type FunctionCache, functionCache } from './lib/function-cache.ts';

import type * as Type from './types.d.ts';
import { routerContext } from './router.ts';

declare let window: Window & FunctionCache<typeof cacheKey>;

const cacheKey = `fn` as const;

export const bind = routerContext === `client`
	? functionCache(cacheKey, { binding: window })
	: functionCache(cacheKey);

export class Component<
	TemplateArgs extends (Type.Args | []) = []
> {
	static styleCache = new WeakMap<Component<any>, HTMLStyleElement>(); // eslint-disable-line @typescript-eslint/no-explicit-any

	constructor(
		readonly template: (...args: TemplateArgs) => string,
		readonly style?: string,
	) {}

	render(...args: TemplateArgs) {
		this.renderStyle();
		return this.renderTemplate(...args);
	}

	renderStyle() {
		if (routerContext !== `client`) {
			return;
		}

		if (!this.style) {
			return;
		}

		const existingStyle = Component.styleCache.get(this);
		if (existingStyle) {
			return;
		}

		const $style = document.createElement(`style`); // TODO2: Scoped styles?
		$style.textContent = this.style;
		document.head.appendChild($style);
		Component.styleCache.set(this, $style);
	}

	renderTemplate(...args: TemplateArgs) {
		return this.template(...args);
	}
}

export const toAttributes = (input: Record<string, string>) =>
	Object.entries(input)
		.map(([key, value]) => `${key}="${value}"`)
		.join(` `);
