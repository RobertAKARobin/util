import { buildRoutes, routeComponent, Router } from '@robertakarobin/web/router.ts';

import indexPage from '@src/pages/index.ts';

export const routes = buildRoutes({
	error404: `/404.html`,
	home: `/`,
	homeJump1: `/#jump1`,
	homeJump2: `/#jump2`,
	ssgNo: `/ssg/no`,
	ssgYes: `/ssg/yes`,
	ssgYesJump1: `/ssg/yes/#jump1`,
	ssgYesJump2: `/ssg/yes/#jump2`,
});

export const router = new Router( // Have to declare routeDefs separately or Typescript gets crabby about circular references
	routes,

	async function(route, routes) {
		switch (route.pathname) {
			case routes.home.pathname:
			case routes.homeJump1.pathname:
			case routes.homeJump2.pathname:
				return new indexPage({ message: `This is a variable` });
			case routes.ssgNo.pathname:
				return new (await import(`@src/pages/ssg-no.ts`)).default();
			case routes.ssgYes.pathname:
			case routes.ssgYesJump1.pathname:
			case routes.ssgYesJump2.pathname:
				return new (await import(`@src/pages/ssg-yes.ts`)).default();
		}
		return new (await import(`@src/pages/error.ts`)).default();
	}
);

export const Route = routeComponent(router);
