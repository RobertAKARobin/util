export { link } from '@robertakarobin/web/components/link.ts';
import type { Resolver, Routes } from '@robertakarobin/web/types.d.ts';

export const routes = {} as const satisfies Routes;

export const resolve: Resolver = input => {
	switch (input.path) {
		default:
			return ``;
	}
};
