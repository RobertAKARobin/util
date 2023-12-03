import { Resolver, type Route, Router } from '@robertakarobin/jsutil/router.ts';
import { RouteComponent } from '@robertakarobin/web/router.ts';

import { IndexPage } from '@src/pages/index.ts';

export const router = new Router({
	error404: `/404.html`,
	home: `/`,
	homeJump1: `/#jump1`,
	homeJump2: `/#jump2`,
	ssgNo: `/ssg/no`,
	ssgYes: `/ssg/yes`,
	ssgYesJump1: `/ssg/yes/#jump1`,
	ssgYesJump2: `/ssg/yes/#jump2`,
});

export const { routes } = router;

export const resolver = new Resolver(router, async(route: Route) => {
	switch (route.href) {
		case routes.home.href:
		case routes.homeJump1.href:
		case routes.homeJump2.href:
			return new IndexPage({
				message: `This is a variable`,
				title: `Home page`,
			});
		case routes.ssgNo.href:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage({
				title: `No SSG page`,
			});
		case routes.ssgYes.href:
		case routes.ssgYesJump1.href:
		case routes.ssgYesJump2.href:
			return new (await import(`@src/pages/ssg-yes.ts`)).YesSSGPage({
				title: `SSG yes`,
			});
	}
	return new (await import(`@src/pages/error.ts`)).ErrorPage({
		title: `Error 404`,
	});
});

export class RouteTo extends RouteComponent {
	router = router;
}
