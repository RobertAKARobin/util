import { App, routeFactory } from '@robertakarobin/web/index.ts';;

export const app = new App(
	{
		error404: `/404.html`,
		home: `/`,
		homeJump1: `/#jump1`,
		homeJump2: `/#jump2`,
		ssgNo: `/ssg/no`,
		ssgYes: `/ssg/yes`,
		ssgYesJump1: `/ssg/yes/#jump1`,
		ssgYesJump2: `/ssg/yes/#jump2`,
	},

	async(path, routes) => {
		switch (path) {
			case routes.error404:
				return (await import(`./pages/error.ts`)).default();
			case routes.home:
			case routes.homeJump1:
			case routes.homeJump2:
				return (await import(`./pages/index.ts`)).default(`This is a variable`);
			case routes.ssgNo:
				return (await import(`./pages/ssg-no.ts`)).default();
			case routes.ssgYes:
			case routes.ssgYesJump1:
			case routes.ssgYesJump2:
				return (await import(`./pages/ssg-yes.ts`)).default();
		}
	},
);

export const route = routeFactory(app);
