import { BaseApp, Resolver, Router } from '@robertakarobin/util/components/app.ts';
import { Component } from '@robertakarobin/util/component.ts';
import { ModalContainer } from '@robertakarobin/util/components/modal-container.ts';

import { Nav } from '@src/components/nav.ts';

export const modalContainer = ModalContainer.find() ?? new ModalContainer();

export const router = new Router({
	error404: `/404.html`,
	external: `https://example.com`,
	home: `/`,
	homeJump1: `/#jump1`,
	homeJump2: `/#jump2`,
	ssgNo: `/ssg/no/`,
	ssgYes: `/ssg/yes/`,
	ssgYesJump1: `/ssg/yes/#jump1`,
	ssgYesJump2: `/ssg/yes/#jump2`,
});

export const resolver = new Resolver(router, async(route: URL) => {
	switch (router.findRouteName(route)) {
		case `home`:
		case `homeJump1`:
		case `homeJump2`:
			return new (await import(`@src/pages/index.ts`)).IndexPage({
				title: `Home page`,
			}).set({
				message: `This is a variable`,
			});
		case `ssgNo`:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage({
				title: `SSG no`,
			});
		case `ssgYes`:
		case `ssgYesJump1`:
		case `ssgYesJump2`:
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
${new Nav()}
${this.page}
${modalContainer}
	`;
}
