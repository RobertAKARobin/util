export { link } from '@robertakarobin/web/components/link.ts';
import type { Resolver, Routes } from '@robertakarobin/web/types.d.ts';

import * as Error from './pages/error.ts';
import { homePage } from './pages/home.ts';

export const routes = {
	error404: `/404` as string,
	home: `/` as string,
} as const satisfies Routes;

export const resolve: Resolver = input => {
	switch (input.path) {
		case routes.home:
			return homePage();
		default:
			return Error.error404();
	}
};
