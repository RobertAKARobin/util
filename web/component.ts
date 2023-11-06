import type * as Type from './types.d.ts';
import { routerContext } from './router.ts';

const StyleCache = new WeakMap<Type.Template, HTMLStyleElement>();

export const component = <Template extends Type.Template>(
	input: Type.ComponentArgs<Template>
): Template => {
	const template = (input.template || (() => ``));

	return ((...args: Parameters<Template>) => {
		if (
			routerContext === `browser`
			&& input.style
			&& !StyleCache.has(template)
		) {
			const $style = document.createElement(`style`); // TODO1: Scoped styles!
			$style.textContent = input.style;
			document.head.appendChild($style);
			StyleCache.set(template, $style);
		}

		return template(...args);
	}) as Template;
};
