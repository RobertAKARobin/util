import * as $ from '@robertakarobin/jsutil';

type CachedFunction = (event: UIEvent, thisArg: HTMLElement) => void;

export class FunctionCache {
	private cache: Record<string, CachedFunction> = {};
	private cacheIndex = 0;

	constructor(
		readonly cachePropertyName: string,
	) {}

	call = <InputFunction extends (
		(
			this: HTMLElement,
			event: UIEvent,
			...args: Array<any> // eslint-disable-line @typescript-eslint/no-explicit-any
		) => void
	)>(
		inputFunction: InputFunction,
		...args: $.Type.OmitParam1<InputFunction>
	): string => {
		const key = `f${this.cacheIndex}`;
		this.cacheIndex += 1;
		this.cache[key] = (event: UIEvent, thisArg: HTMLElement) =>
			inputFunction.call(thisArg, event, ...args);
		return `${this.cachePropertyName}['${key}'](event, this)`;
	};
}

// export class Component {
// 	$els = [];
// 	state;
// 	template;

// 	static call(inputFunction, ...args) {
// 		const key = `f${cacheIndex}`;
// 		cacheIndex += 1;
// 		window[cachePropertyName][key] =
// 			(event, thisArg) => inputFunction.call(thisArg, event, ...args);
// 		return `${cachePropertyName}.${key}(event, this)`;
// 	};

// 	constructor($els) {
// 		if (Array.isArray($els)) {
// 			this.$els = $els;
// 		} else {
// 			this.$els = [$els];
// 		}
// 	}

// 	render() {
// 		window[cachePropertyName] = {};
// 		const rendered = this.template(this);
// 		for (const $el of this.$els) {
// 			$el.innerHTML = rendered;
// 		}
// 	}

// 	// set(setter) {
// 	// 	return this.call(event => State.set(setter(event.target.value)));
// 	// }
// }
