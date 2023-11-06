import type * as Type from './types.d.ts';
import { routerContext } from './router.ts';

type CachedFunction<
	DispatchedEvent extends Event = Event,
	Args extends Array<string> = any // eslint-disable-line @typescript-eslint/no-explicit-any
> = (event: DispatchedEvent, ...args: Args) => void;

const windowCacheProperty = `fn` as const;
const functionsByKey = new Map<string, CachedFunction<any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const keysByFunction = new Map<CachedFunction<any>, string>(); // eslint-disable-line @typescript-eslint/no-explicit-any
if (routerContext === `browser`) {
	type WindowWithCache = Window & {
		[key in typeof windowCacheProperty]: typeof functionsByKey;
	};
	(window as unknown as WindowWithCache)[windowCacheProperty] = functionsByKey;
}

let cacheSize = 1;
export const bind = <
	DispatchedEvent extends Event,
	Args extends Array<string> = Array<string>
>(input: CachedFunction<DispatchedEvent, Args>, ...args: Args): string => {
	if (routerContext !== `browser`) {
		return `""`;
	}

	let cachedFunctionKey = keysByFunction.get(input);
	if (!cachedFunctionKey) {
		cachedFunctionKey = `f${cacheSize}`;
		cacheSize += 1;
		functionsByKey.set(cachedFunctionKey, input);
		keysByFunction.set(input, cachedFunctionKey);
	}

	const argsString = args.map(arg => `'${arg}'`).join(``);
	return `"${windowCacheProperty}.get('${cachedFunctionKey}').call(this, event, ${argsString})"`;
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
