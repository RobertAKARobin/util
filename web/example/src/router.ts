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
	switch (route) {
		case routes.home:
		case routes.homeJump1:
		case routes.homeJump2:
			return new IndexPage({ message: `This is a variable` });
		case routes.ssgNo:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage();
		case routes.ssgYes:
		case routes.ssgYesJump1:
		case routes.ssgYesJump2:
			return new (await import(`@src/pages/ssg-yes.ts`)).YesSSGPage();
	}
	return new (await import(`@src/pages/error.ts`)).ErrorPage();
});

export class RouteTo extends RouteComponent {
	router = router;
}
