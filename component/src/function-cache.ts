import * as $ from '@robertakarobin/jsutil';

type CachedFunction = (event: UIEvent, thisArg: HTMLElement) => void;

type InputFunction = (
	this: HTMLElement,
	event: UIEvent,
	...args: Array<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => void;

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
		inputFunction: Input,
		...args: $.Type.OmitParam1<Input>
	): string => {
		const key = `f${this.cacheIndex}`;
		this.cacheIndex += 1;
		this.cache[key] = (event: UIEvent, thisArg: HTMLElement) =>
			inputFunction.call(thisArg, event, ...args);
		return `${String(this.bindingName)}.cache['${key}'](event, this)`;
	};
}

// set(setter) {
// 	return this.call(event => State.set(setter(event.target.value)));
// }
