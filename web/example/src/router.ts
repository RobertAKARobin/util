import { routeComponent, Router } from '@robertakarobin/web/index.ts';

import { IndexPage } from './pages/index.ts';

const routeDefs = {
	error404: `/404.html`,
	home: `/`,
	homeJump1: `/#jump1`,
	homeJump2: `/#jump2`,
	ssgNo: `/ssg/no`,
	ssgYes: `/ssg/yes`,
	ssgYesJump1: `/ssg/yes/#jump1`,
	ssgYesJump2: `/ssg/yes/#jump2`,
};

export const router: Router<typeof routeDefs> = new Router( // Have to declare routeDefs separately or Typescript gets crabby about circular references
	routeDefs,

	async function(url) {
		switch (url.pathname) {
			case this.routes.error404.pathname:
				return new (await import(`./pages/error.ts`)).ErrorPage();
			case this.routes.home.pathname:
			case this.routes.homeJump1.pathname:
			case this.routes.homeJump2.pathname:
				return new IndexPage({
					message: `This is a variable`,
				});
			case this.routes.ssgNo.pathname:
				return new (await import(`./pages/ssg-no.ts`)).NoSSGPage();
			case this.routes.ssgYes.pathname:
			case this.routes.ssgYesJump1.pathname:
			case this.routes.ssgYesJump2.pathname:
				return new (await import(`./pages/ssg-yes.ts`)).YesSSGPage();
		}
	}
);

export const routeTo = routeComponent(router);
