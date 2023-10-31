export { link } from '@robertakarobin/web/components/link.ts';
import type { Resolver, Routes } from '@robertakarobin/web/types.d.ts';

import { errorPage } from './pages/error.ts';
import { indexPage } from './pages/index.ts';
import { layout } from './pages/_layout.ts';

export const routes = {
	home: `/`,
} as const satisfies Routes;

export const resolve: Resolver = input => {
	switch (input.path) {
		case routes.home:
			return layout.render(`Home page`, indexPage.render());
		default:
			return layout.render(`Error 404`, errorPage.render());
	}
};
