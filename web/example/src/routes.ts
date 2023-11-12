import { resolver, routeMap } from '@robertakarobin/web/index.ts';

export const routes = routeMap({
	error404: `/404.html`,
	home: `/`,
	ssgNo: `/ssg/no`,
	ssgYes: `/ssg/yes`,
});

export const resolve = resolver(routes, async path => {
	switch (path) {
		case routes.error404:
			return (await import(`./pages/error.ts`)).default();
		case routes.home:
			return (await import(`./pages/index.ts`)).default(`This is a variable`);
		case routes.ssgNo:
			return (await import(`./pages/ssg-no.ts`)).default();
		case routes.ssgYes:
			return (await import(`./pages/ssg-yes.ts`)).default();
	}
});
