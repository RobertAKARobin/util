import { LinkComponent, Resolver, type Route, Router } from '@robertakarobin/util/router.ts';

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
	switch (route.pathname) {
		case routes.home.pathname:
		case routes.homeJump1.pathname:
		case routes.homeJump2.pathname:
			return new IndexPage().set({
				message: `This is a variable`,
				title: `Home page`,
			});
		case routes.ssgNo.pathname:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage().set({
				title: `No SSG page`,
			});
		case routes.ssgYes.pathname:
		case routes.ssgYesJump1.pathname:
		case routes.ssgYesJump2.pathname:
			return new (await import(`@src/pages/ssg-yes.ts`)).YesSSGPage().set({
				title: `SSG yes`,
			});
	}
	return new (await import(`@src/pages/error.ts`)).ErrorPage().set({
		title: `Error 404`,
	});
});

export class Link extends LinkComponent {
	static {
		this.init();
	}

	router = router;
}

Link.init();
