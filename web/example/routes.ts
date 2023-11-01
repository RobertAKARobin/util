import type * as Type from '@robertakarobin/web/types.d.ts';
export { template as link } from '@robertakarobin/web/components/link.ts';
import { lazy } from '@robertakarobin/web/plugins/index.ts';

import type * as errorPage from './pages/error.ts';
import type * as indexPage from './pages/index.ts';

export const routes = {
	error404: `/404`,
	home: `/`,
} as const satisfies Type.Routes;

export const resolve: Type.Resolver = async path => {
	switch (path) {
		case routes.home:
			return lazy<typeof indexPage, `indexPage`>(
				`../example/pages/index.ts`,
				`indexPage`
			);
		case routes.error404:
			return lazy<typeof errorPage, `errorPage`>(
				`../example/pages/error.ts`,
				`errorPage`
			);
		default:
			return lazy<typeof errorPage, `errorPage`>(
				`../example/pages/error.ts`,
				`errorPage`
			);
	}
};
