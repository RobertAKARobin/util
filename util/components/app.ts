import { Resolver, type RouteMap, Router } from '../router.ts';
import { appContext } from '../context.ts';

import { Component, Page } from './component.ts';

export { Resolver, RouteMap, Router };

export abstract class BaseApp<
	Routes extends RouteMap = any, // eslint-disable-line @typescript-eslint/no-explicit-any
> extends Component.custom(`body`) {
	static readonly elName = `l-app`;
	page!: Page;
	abstract readonly resolver: Resolver<Page>;
	abstract readonly router: Router<Routes>;

	async connectedCallback() {
		super.connectedCallback();

		if (appContext === `browser`) {
			this.router.init();
		}

		const components: Array<Component> = Array.from(
			document.querySelectorAll(`[${Component.const.attrEl}]`)
		);

		const componentsLoaded = components.map(component =>
			customElements.whenDefined(
				component.getAttribute(Component.const.attrEl)!
			)
		);

		await Promise.all(componentsLoaded);

		this.resolver.subscribe((newPage, { previous }) => {
			this.onPage(newPage, previous);
		});

		if (appContext === `browser`) {
			let landingPage = this.findDown(Page, 0)();
			const expectedPage = await this.resolver.resolve(new URL(location.href));
			if (landingPage.constructor !== expectedPage.constructor) {
				landingPage = expectedPage;
			}
			this.resolver.set(landingPage);
		}
	}

	onPage(newPage: Page, previous: Page) {
		if (newPage === previous) {
			return;
		}

		if (previous === undefined) {
			this.page = newPage;;
			if (appContext !== `browser`) {
				this.render();
			}
		} else {
			this.page.replaceWith(newPage.render());
			this.page = newPage;
		}

		document.title = this.page.pageTitle;
	}

	template() {
		return `${this.page}`;
	}
}
