import type * as Type from './types.d.ts';
import { routerContext } from './router.ts';

const StyleCache = new WeakMap<Type.Template, HTMLStyleElement>();

export const component = <Template extends Type.Template>(
	input: Type.ComponentArgs<Template>
) => {
	return (...args: Parameters<Template>) => {
		if (
			routerContext === `browser`
			&& input.style
			&& !StyleCache.has(input.template)
		) {
			const $style = document.createElement(`style`); // TODO2: Scoped styles?
			$style.textContent = input.style;
			document.head.appendChild($style);
			StyleCache.set(input.template, $style);
		}

		return input.template(...args);
	};
};
