import { resolver, routeMap } from '@robertakarobin/web/index.ts';

export const routes = routeMap({
	error404: `/404.html`,
	home: `/`,
	nosplit: `/nosplit`,
	nosplitNofallack: `/nosplit-nofallback`,
	split: `/split`,
	splitNoFallback: `/split-nofallback`,
});

export const resolve = resolver(routes, async path => {
	switch (path) {
		case routes.error404:
			return (await import(`./pages/error.ts`)).default();
		case routes.home:
			return (await import(`./pages/index.ts`)).default(`This is a variable`);
		case routes.nosplit:
			return (await import(`./pages/nosplit.ts`)).default();
		case routes.nosplitNofallack:
			return (await import(`./pages/nosplit-nofallback.ts`)).default();
		case routes.split:
			return (await import(`./pages/split.ts`)).default();
		case routes.splitNoFallback:
			return (await import(`./pages/split-nofallback.ts`)).default();
	}
});
