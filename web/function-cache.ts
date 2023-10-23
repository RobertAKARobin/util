
type BindingName = string;

export type CachedFunction<
	DispatchedEvent extends Event = Event,
	Args extends Array<string> = Array<string>
> = (
	this: HTMLElement,
	event: DispatchedEvent,
	...args: Args
) => void;

type CacheKey = string;

export type FunctionCache = Record<BindingName, Map<CacheKey, CachedFunction>>;

export function createCache(
	bindingName: BindingName,
	options: Partial<{
		binding: FunctionCache;
	}> = {}
) {
	const functionsByKey = new Map<CacheKey, CachedFunction>(); // TODO1: Use caching that allows garbage collection
	const keysByFunction = new Map<CachedFunction, CacheKey>();
	let cacheIndex = 0;

	if (options.binding) {
		options.binding[bindingName] = functionsByKey;
	}

	return function bind<
		DispatchedEvent extends Event,
		Args extends Array<string>
	>(
		inputFunction: CachedFunction<DispatchedEvent, Args>,
		...args: Args
	): string {
		let cacheKey = keysByFunction.get(inputFunction as CachedFunction);
		if (typeof cacheKey === `undefined`) {
			cacheKey = `f${cacheIndex}`;
			cacheIndex += 1;
			functionsByKey.set(cacheKey, inputFunction as CachedFunction);
			keysByFunction.set(inputFunction as CachedFunction, cacheKey);
		}
		const argsString = args.map(arg => `'${arg}'`).join(``);
		return `${String(bindingName)}.get('${cacheKey}').call(this, event, ${argsString})`;
	};
}

// set(setter) {
// 	return this.call(event => State.set(setter(event.target.value)));
// }
