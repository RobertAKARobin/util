import type * as Type from '@robertakarobin/web/types.d.ts';
import {
	layout,
	lazy,
	link,
	routerContext,
	title,
} from '@robertakarobin/web';

import type * as Layout from './pages/_layout.ts';

import type * as ErrorPage from './pages/error.ts';
import type * as IndexPage from './pages/index.ts';

export { link }; // So we can import link along with routes, since they're usually used together

const layoutTemplate = lazy<typeof Layout>(`./pages/layout.ts`);

const indexPage = lazy<typeof IndexPage>(`./pages/index.ts`);
const errorPage = lazy<typeof ErrorPage>(`./pages/error.ts`);

export const routes = {
	error404: `/404`,
	home: `/`,
} as const satisfies Type.Routes;

export const resolve = async(path: Type.RoutePath): Promise<string> => {
	if (routerContext === `build`) {
		layout.next(await layoutTemplate(`default`));
	}

	switch (path) {
		case routes.home:
			title.next(`Home`);
			return await indexPage(`default`, []);
		default:
			title.next(`Error 404`);
			return await errorPage(`default`, []);
	}
};
