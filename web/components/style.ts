import type * as Type from '../types.d.ts';
import { routerContext } from '../router.ts';

const StyleCache = new WeakMap<Type.Template, HTMLStyleElement>();

export const styled = (style: string, template: Type.Template) => {
	if (routerContext !== `client`) {
		return template;
	}

	const existingStyle = StyleCache.get(template);
	if (existingStyle) {
		return template;
	}

	const $style = document.createElement(`style`); // TODO2: Scoped styles?
	$style.textContent = style;
	document.head.appendChild($style);
	StyleCache.set(template, $style);
	return template;
};
