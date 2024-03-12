import { BaseApp, Resolver, Router } from '@robertakarobin/util/components/app.ts';
import { Component, html } from '@robertakarobin/util/components/component.ts';
import { appContext } from '@robertakarobin/util/context.ts';
import { ModalContainer } from '@robertakarobin/util/components/modal-container.ts';

import { Nav } from '@src/components/nav.ts';
import { routes } from './routes.ts';

export const router = new Router(routes);

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
	readonly nav = this.findDown(Nav, 0);
	readonly resolver = resolver;
	readonly router = router;

	async connectedCallback() {
		await super.connectedCallback();

		if (appContext === `browser`) {
			this.appendChild(new ModalContainer());
		}

		this.resolver.subscribe(() => this.nav().render());
	}

	template = () => html`
${new Nav()}
${this.page}
	`;
}
