import type * as Type from '@robertakarobin/web/types.d.ts';
import { layout, link, routerContext } from '@robertakarobin/web';

export { link }; // So we can import link along with routes, since they're usually used together

export const routes = {
	error404: `/404.html`,
	home: `/`,
} as const satisfies Type.Routes;

export const resolve = async(path: Type.RoutePath): Promise<string> => {
	if (routerContext === `build`) {
		layout.next((await import(`./pages/_layout.ts`)).default);
	}

	switch (path) {
		case routes.home:
			return (await import(`./pages/index.ts`)).default();
		default:
			return (await import(`./pages/error.ts`)).default();
	}
};
