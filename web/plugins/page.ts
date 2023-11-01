import type * as Type from '../types.d.ts';
import { routerContext } from '../router.ts';

export const page = <Template extends Type.Template>(
	title: string,
	layout: Type.PageLayout, // TODO2: Exclude this from client-side bundle
	template: Template,
) => {
	return async(...args: Parameters<Template>) => {
		const compiled = await template(...args);

		if (routerContext === `client`) {
			document.title = title;
			return compiled;
		}

		return layout(title, compiled);
	};
};
