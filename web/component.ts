import type * as Type from './types.d.ts';
import { routerContext } from './router.ts';

type CachedFunction<
	DispatchedEvent extends Event = Event,
	Args extends Array<string> = Array<string>
> = (event: DispatchedEvent, ...args: Args) => void;

type FunctionCache = WeakMap<HTMLElement, CachedFunction<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

const windowCacheProperty = `fn` as const;
const functionCache: FunctionCache = new WeakMap();
if (routerContext === `browser`) {
	type WindowWithCache = Window & {
		[key in typeof windowCacheProperty]: FunctionCache;
	};
	(window as unknown as WindowWithCache)[windowCacheProperty] = functionCache;
}

export const bind = <
	DispatchedEvent extends Event,
	Args extends Array<string>
>(input: CachedFunction<DispatchedEvent, Args>, ...args: Args): string => {
	if (routerContext !== `browser`) {
		return `""`;
	}

	const argsString = args.map(arg => `'${arg}'`).join(``);
	return `"${windowCacheProperty}.get(this).call(this, event, ${argsString})"`;
};

const styleCache = new Map<Type.Template, HTMLStyleElement>(); // This is a Map instead of a WeakMap because we don't want <style> elements to be garbage collected; once a style is applied to a page it is permanent
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
