import type * as Type from './types.d.ts';
import { Emitter } from '@robertakarobin/emit/index.ts';

export const pageStatic = new Emitter<string>();

export const page = (input: {
	static?: string;
	style: string;
	template: Type.Template;
}) => {
	pageStatic.next(input.static!);
	return input.template;
};
