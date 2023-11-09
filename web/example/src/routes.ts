import { resolver, routeMap } from '@robertakarobin/web/index.ts';

export const routes = routeMap({
	bundled: `/bundled`,
	bundledFallback: `/bundled-fallback`,
	error404: `/404.html`,
	home: `/`,
	split: `/split`,
	splitFallback: `/split-fallback`,
});

export const resolve = resolver(routes, async path => {
	switch (path) {
		case routes.bundled:
			return (await import(`./pages/bundled.ts`)).default();
		case routes.bundledFallback:
			return (await import(`./pages/bundled-fallback.ts`)).default();
		case routes.error404:
			return (await import(`./pages/error.ts`)).default();
		case routes.home:
			return (await import(`./pages/index.ts`)).default(`This is a variable`);
		case routes.split:
			return (await import(`./pages/split.ts`)).default();
		case routes.splitFallback:
			return (await import(`./pages/split-fallback.ts`)).default();
	}
});
