import type * as Type from '@robertakarobin/web/types.d.ts';
// import { lazy } from '@robertakarobin/web';

// import type * as indexPage from './pages/index.ts';
import { errorPage } from './pages/error.ts';
import { indexPage } from './pages/index.ts';

export const routes = {
	error404: `/404`,
	home: `/`,
} as const satisfies Type.Routes;

export const resolve: Type.Resolver = async path => {
	switch (path) {
		case routes.home:
			return indexPage();
			// return lazy<typeof indexPage, `indexPage`>(
			// 	`./pages/index.ts`,
			// 	`indexPage`
			// );
		case routes.error404:
			return errorPage();
		default:
			return errorPage();
	}
};
