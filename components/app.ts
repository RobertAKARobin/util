import { Resolver, type RouteMap, Router } from '../router.ts';
import { appContext } from '../context.ts';

import { Component, Page } from '../component.ts';

export { Resolver, RouteMap, Router };

export abstract class BaseApp<
	Routes extends RouteMap = any, // eslint-disable-line @typescript-eslint/no-explicit-any
> extends Component.custom(`body`) {
	static elName = `l-app`;
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
			this.resolver.set(this.findDown(Page));
		}
	}

	onPage(newPage: Page, previous: Page) {
		if (newPage === previous) {
			return;
		}
		this.page = newPage;
		document.title = this.page.pageTitle;
		this.render();
	}

	// TODO2: Move formatHead from build to here

	template() {
		return `${this.page}`;
	}
}
