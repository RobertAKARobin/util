import * as $ from '@robertakarobin/jsutil';

export type FunctionCache = Record<string, Record<string, CachedFunction>>;

export type CachedFunction = (event: Event, thisArg: HTMLElement) => void;

type InputFunction = (...args: Array<any>) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

type GetEvent<InputFunction> =
	InputFunction extends (event: infer DispatchedEvent extends Event) => void
		? DispatchedEvent
		: never;

export function createCache(
	bindingName: string,
	options: Partial<{
		binding: FunctionCache;
	}> = {}
) {
	const cache: Record<string, CachedFunction> = {};
	let cacheIndex = 0;

	if (options.binding) {
		options.binding[bindingName] = cache;
	}

	return function bind<Input extends InputFunction>(
		inputFunction: Input, // TODO3: Enforce that the `event` in callback must subclass Event
		...args: $.Type.OmitParam1<Input>
	): string {
		const key = `f${cacheIndex}`;
		cacheIndex += 1;

		const cachedFunction = (event: GetEvent<Input>, thisArg: HTMLElement) =>
			inputFunction.call(thisArg, event as $.Type.Param1<Input>, ...args);
		cache[key] = cachedFunction as CachedFunction;
		return `${String(bindingName)}['${key}'](event, this)`;
	};
}

// set(setter) {
// 	return this.call(event => State.set(setter(event.target.value)));
// }
