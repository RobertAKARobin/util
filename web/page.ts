import { Emitter } from '@robertakarobin/emit';

import type * as Type from './types.d.ts';
import { component } from './component.ts';
import { title } from './router.ts';

export const pageStatic = new Emitter<string>();

export const page = <Template extends Type.Template>(
	input: Type.PageArgs<Template>
) => {
	pageStatic.next(input.importMetaUrl!);
	title.next(input.title);

	return component(input);
};
