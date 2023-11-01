import { routerContext } from '../router.ts';

const cacheKey = `fn` as const;
type WindowWithCache = Window & FunctionCache<typeof cacheKey>;
export const bind = routerContext === `client`
	? functionCache(cacheKey, { binding: window as unknown as WindowWithCache })
	: functionCache(cacheKey);

export type FunctionCache<
	BindingName extends string
> = Record<
	BindingName,
	Map<FunctionCacheKey, FunctionCacheEntry>
>;

export type FunctionCacheEntry<
	DispatchedEvent extends Event = Event,
	Args extends Array<string> = Array<string>
> = (
	this: HTMLElement,
	event: DispatchedEvent,
	...args: Args
) => void;

type FunctionCacheKey = string;

export function functionCache<
	BindingName extends string
>(
	bindingName: BindingName,
	options: Partial<{
		binding: FunctionCache<BindingName>;
	}> = {}
) {
	const functionsByKey = new Map<FunctionCacheKey, FunctionCacheEntry>(); // TODO2: Use caching that allows garbage collection
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
