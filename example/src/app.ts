import { BaseApp, Resolver, Router } from '@robertakarobin/util/util/components/app';
import { Component } from '@robertakarobin/util/util/components/component';
import { ModalContainer } from '@robertakarobin/util/util/components/modal-container';
import { runContext } from '@robertakarobin/util/util/web/context';

import { Nav } from '@src/components/nav';
import { routes } from './routes';

export const router = new Router(routes);

export const resolver = new Resolver(router, async(route: URL) => {
	switch (router.findRouteName(route)) {
		case `home`:
		case `homeJump1`:
		case `homeJump2`:
			return new (await import(`@src/pages/index`)).IndexPage({
				title: `Home page`,
			}).set({
				message: `This is a variable`,
			});
		case `ssgNo`:
			return new (await import(`@src/pages/ssg-no`)).NoSSGPage({
				title: `SSG no`,
			});
		case `ssgYes`:
		case `ssgYesJump1`:
		case `ssgYesJump2`:
			return new (await import(`@src/pages/ssg-yes`)).YesSSGPage({
				title: `SSG yes`,
			});
	}
	return new (await import(`@src/pages/error`)).ErrorPage({
		title: `Error 404`,
	});
});

@Component.define()
export class App extends BaseApp {
	readonly nav = this.findDown(Nav);
	readonly resolver = resolver;
	readonly router = router;

	override async connectedCallback() {
		await super.connectedCallback();

		if (runContext === `browser`) {
			this.appendChild(new ModalContainer());
			this.render(Nav.selector);
		}

		resolver.subscribe(() => this.render(Nav.selector));
	}

	override template = () => /*html*/`
${new Nav()}
${this.page}
	`;
}
