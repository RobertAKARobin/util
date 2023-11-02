import type * as Type from '../types.d.ts';
import { routerContext } from '../router.ts';

const StyleCache = new WeakMap<Type.Template, HTMLStyleElement>();

export const withStyle = <Template extends Type.Template>(css: string, template: Template) => {
	return (...args: Parameters<Template>) => {
		const compiled = template(...args);

		if (routerContext !== `browser`) {
			return compiled;
		}

		const existingStyle = StyleCache.get(template);
		if (existingStyle) {
			return compiled;
		}

		const $style = document.createElement(`style`); // TODO2: Scoped styles?
		$style.textContent = css;
		document.head.appendChild($style);
		StyleCache.set(template, $style);
		return compiled;
	};
};
