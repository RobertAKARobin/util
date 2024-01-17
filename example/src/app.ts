import { BaseApp, Resolver, Router } from '@robertakarobin/web/app.ts';
import { Component } from '@robertakarobin/web/component.ts';
import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';

import { Nav } from '@src/components/nav.ts';

export const modalContainer = ModalContainer.find() ?? new ModalContainer();

export const router = new Router({
	error404: `/404.html`,
	external: `https://example.com`,
	home: `/`,
	homeJump1: `/#jump1`,
	homeJump2: `/#jump2`,
	ssgNo: `/ssg/no`,
	ssgYes: `/ssg/yes`,
	ssgYesJump1: `/ssg/yes/#jump1`,
	ssgYesJump2: `/ssg/yes/#jump2`,
});

export const resolver = new Resolver(router, async(route: URL) => {
	switch (route.pathname) {
		case router.paths.home:
		case router.paths.homeJump1:
		case router.paths.homeJump2:
			return new (await import(`@src/pages/index.ts`)).IndexPage({
				title: `Home page`,
			}).set({
				message: `This is a variable`,
			});
		case router.paths.ssgNo:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage({
				title: `SSG no`,
			});
		case router.paths.ssgYes:
		case router.paths.ssgYesJump1:
		case router.paths.ssgYesJump2:
			return new (await import(`@src/pages/ssg-yes.ts`)).YesSSGPage({
				title: `SSG yes`,
			});
	}
	return new (await import(`@src/pages/error.ts`)).ErrorPage({
		title: `Error 404`,
	});
});

@Component.define()
export class App extends BaseApp {
	resolver = resolver;
	router = router;

	template = () => /*html*/`
${Nav()}
${this.page}
${modalContainer}
	`;
}