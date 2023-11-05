import type * as Type from '@robertakarobin/web/types.d.ts';
import { link } from '@robertakarobin/web';

import genericPage from './pages/generic.ts';

export { link }; // So we can import link along with routes, since they're usually used together

const routesToTest: Array<Parameters<typeof genericPage>> = [
	[`test/t0`, `bundle`, true],
	[`test/t1`, `bundle`, false],
	[`test/t2`, `dynamic`, true],
	[`test/t3`, `dynamic`, false],
];

export const routes: Type.Routes = {
	error404: `/404.html`,
	home: `/`,
	...routesToTest.reduce((routes, [prefix, load, fallback]) => {
		const path = [prefix, load, ...(fallback ? [`fallback`] : [])].join(`/`);
		routes[prefix] = path;
		return routes;
	}, {} as Type.Routes),
};

export const resolve = async(path: Type.RoutePath) => {
	for (const [prefix, ...args] of routesToTest) {
		const [load] = args;
		const testPath = `/${routes[prefix]}/`;
		if (path !== testPath) {
			continue;
		}

		if (load === `bundle`) {
			return genericPage(testPath, ...args)();
		} else {
			return (await import(`./pages/generic.ts`)).default(testPath, ...args)();
		}
	}

	switch (path) {
		case routes.home:
			return (await import(`./pages/index.ts`)).default();
		default:
			return (await import(`./pages/error.ts`)).default();
	}
};
