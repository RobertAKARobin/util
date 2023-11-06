import type * as Type from './types.d.ts';
import { routerContext } from './router.ts';

type CachedFunction<
	DispatchedEvent extends Event = Event,
	Args extends Array<string> = Array<string>
> = (event: DispatchedEvent, ...args: Args) => void;

type FunctionCache = WeakMap<HTMLElement, CachedFunction<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

const cacheKey = `fn` as const;
const functionCache: FunctionCache = new WeakMap();
if (routerContext === `browser`) {
	type WindowWithCache = Window & { [key in typeof cacheKey]: FunctionCache; };
	(window as unknown as WindowWithCache)[cacheKey] = functionCache;
}
export const bind = <
	DispatchedEvent extends Event,
	Args extends Array<string>
>(input: CachedFunction<DispatchedEvent, Args>, ...args: Args): string => {
	if (routerContext !== `browser`) {
		return `""`;
	}

	const argsString = args.map(arg => `'${arg}'`).join(``);
	return `"${cacheKey}.get(this).call(this, event, ${argsString})"`;
};

const styleCache = new WeakMap<Type.Template, HTMLStyleElement>();
export const component = <Template extends Type.Template>(
	input: Type.ComponentArgs<Template>
): Template => {
	const template = (input.template || (() => ``));

	return ((...args: Parameters<Template>) => {
		if (
			routerContext === `browser`
			&& input.style
			&& !styleCache.has(template)
		) {
			const $style = document.createElement(`style`);
			$style.textContent = input.style;
			document.head.appendChild($style);
			styleCache.set(template, $style);
		}

		return template(...args);
	}) as Template;
};
