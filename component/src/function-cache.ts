import * as $ from '@robertakarobin/jsutil';

type CachedFunction = (event: Event, thisArg: HTMLElement) => void;

type InputFunction = (...args: Array<any>) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

type GetEvent<InputFunction> =
	InputFunction extends (event: infer DispatchedEvent extends Event) => void
		? DispatchedEvent
		: never;

export class FunctionCache<
	BindingName extends string | number | symbol = string | number | symbol
> {
	private cache: Record<string, CachedFunction> = {};
	private cacheIndex = 0;

	constructor(
		readonly bindingName: BindingName,
		options: Partial<{
			binding: Record<BindingName, FunctionCache>;
		}> = {}
	) {
		if (options.binding) {
			options.binding[bindingName] = this;
		}
	}

	call = <Input extends InputFunction>(
		inputFunction: Input, // TODO3: Enforce that the `event` in callback must subclass Event
		...args: $.Type.OmitParam1<Input>
	): string => {
		const key = `f${this.cacheIndex}`;
		this.cacheIndex += 1;

		const cachedFunction = (event: GetEvent<Input>, thisArg: HTMLElement) =>
			inputFunction.call(thisArg, event as $.Type.Param1<Input>, ...args);
		this.cache[key] = cachedFunction as CachedFunction;
		return `${String(this.bindingName)}.cache['${key}'](event, this)`;
	};
}

// set(setter) {
// 	return this.call(event => State.set(setter(event.target.value)));
// }
