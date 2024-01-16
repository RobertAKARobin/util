import { Resolver, type RouteMap, Router } from '@robertakarobin/util/router.ts';
import { appContext } from '@robertakarobin/util/context.ts';

import { Component, Page } from './component.ts';

export { Resolver, RouteMap, Router };

export abstract class BaseApp<
	Routes extends RouteMap = Record<string, never>,
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

		this.resolver
			.subscribe((newPage, { previous }) => {
				if (newPage !== previous) {
					this.page = newPage;
					document.title = this.page.pageTitle;
					this.render({ force: true });
				}
			});

		if (appContext === `browser`) {
			this.resolver.set(this.querySelector(`[${Page.$pageAttr}]`)!);
		}
	}

	// TODO2: Move formatHead from build to here

	template() {
		return `${this.page}`;
	}
}
