import { Emitter } from '@robertakarobin/emit/index.ts';

declare let window: Window & FunctionCache;

export type Args = Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const bind = functionCache(`foo`, { binding: window });

export type Component<
	TemplateArgs extends Args = Args
> = {
	style?: string;
	template: Template<TemplateArgs>;
};

export const component = <
	TemplateArgs extends Args
>(input: Component<TemplateArgs>) => {
	if (input.style && !componentStyleCache.has(input as Component)) { // TODO1: Handle when not CSR
		const $style = document.createElement(`style`); // TODO1: Scoped styles?
		$style.textContent = input.style;
		document.head.appendChild($style);
		componentStyleCache.set(input as Component, $style);
	}

	return (...args: TemplateArgs) => {
		return input.template(...args);
	};
};

const componentStyleCache = new WeakMap<Component, HTMLStyleElement>();

export type FunctionCache = Record<
	FunctionCacheBindingName,
	Map<FunctionCacheKey, FunctionCacheEntry>
>;

export function functionCache(
	bindingName: FunctionCacheBindingName,
	options: Partial<{
		binding: FunctionCache;
	}> = {}
) {
	const functionsByKey = new Map<FunctionCacheKey, FunctionCacheEntry>(); // TODO1: Use caching that allows garbage collection
	const keysByFunction = new Map<FunctionCacheEntry, FunctionCacheKey>();
	let cacheIndex = 0;

	if (options.binding) {
		options.binding[bindingName] = functionsByKey;
	}

	return function bind<
		DispatchedEvent extends Event,
		Args extends Array<string>
	>(
		inputFunction: FunctionCacheEntry<DispatchedEvent, Args>,
		...args: Args
	): string {
		let cacheKey = keysByFunction.get(inputFunction as FunctionCacheEntry);
		if (typeof cacheKey === `undefined`) {
			cacheKey = `f${cacheIndex}`;
			cacheIndex += 1;
			functionsByKey.set(cacheKey, inputFunction as FunctionCacheEntry);
			keysByFunction.set(inputFunction as FunctionCacheEntry, cacheKey);
		}
		const argsString = args.map(arg => `'${arg}'`).join(``);
		return `"${String(bindingName)}.get('${cacheKey}').call(this, event, ${argsString})"`;
	};
}

type FunctionCacheBindingName = string;

export type FunctionCacheEntry<
	DispatchedEvent extends Event = Event,
	Args extends Array<string> = Array<string>
> = (
	this: HTMLElement,
	event: DispatchedEvent,
	...args: Args
) => void;

type FunctionCacheKey = string;

export class Router extends Emitter<string> {
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

export const router = new Router();

export type Routes = Record<string, string | RouteFunction>;

export type RouteFunction = (params: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any

export const toAttributes = (input: Record<string, string>) =>
	Object.entries(input)
		.map(([key, value]) => `${key}="${value}"`)
		.join(` `);

export type Template<
	TemplateArgs extends Args = Args
> = (...args: TemplateArgs) => string;
