import { routeComponent, routeHashes, Router } from '@robertakarobin/web/index.ts';

export const routes = {
	error404: `/404.html`,
	home: `/`,
	homeJump1: `/#jump1`,
	homeJump2: `/#jump2`,
	ssgNo: `/ssg/no`,
	ssgYes: `/ssg/yes`,
	ssgYesJump1: `/ssg/yes/#jump1`,
	ssgYesJump2: `/ssg/yes/#jump2`,
};

export const router = new Router(routes, async(path, routes) => {
	switch (path) {
		case routes.error404:
			return new (await import(`./pages/error.ts`)).ErrorPage();
		case routes.home:
		case routes.homeJump1:
		case routes.homeJump2:
			return new (await import(`./pages/index.ts`)).IndexPage({
				message: `This is a variable`,
			});
		case routes.ssgNo:
			return new (await import(`./pages/ssg-no.ts`)).NoSSGPage();
		case routes.ssgYes:
		case routes.ssgYesJump1:
		case routes.ssgYesJump2:
			return new (await import(`./pages/ssg-yes.ts`)).YesSSGPage();
	}
});

export const routeHash = routeHashes(routes);

export const routeTo = routeComponent(router);
