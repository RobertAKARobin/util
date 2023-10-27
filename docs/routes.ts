export { link } from '@robertakarobin/web/components/link.ts';
import type { Resolver, Routes } from '@robertakarobin/web/types.d.ts';

import * as Error from './pages/error.ts';
import { homePage } from './pages/home.ts';
import { layout } from './pages/_layout.ts';
import { test } from './pages/test.ts';

export const routes = {
	error404: `/404`,
	home: `/`,
	test: `/test`,
} as const satisfies Routes;

export const resolve: Resolver = input => { // TODO1: Make async, and await pages
	switch (input.path) {
		case routes.home:
			return layout(`Home`, homePage());
		case routes.test:
			return layout(`Test`, test());
		default:
			return layout(`Error`, Error.error404());
	}
};
