import { Resolver, type RouteMap, Router } from '@robertakarobin/util/router.ts';

import { Component, Page } from './component.ts';
import { appContext } from '../context.ts';

export { Resolver, RouteMap, Router };

export abstract class BaseApp<
	Routes extends RouteMap = Record<string, never>,
> extends Component.custom(`body`) {
	static elName = `l-app`;
	page!: Page;
	abstract readonly resolver: Resolver<Page>;
	@Component.attribute() routeName!: keyof Routes;
	abstract readonly router: Router<Routes>;

	async connectedCallback() {
		super.connectedCallback();

		if (appContext === `browser`) {
			this.router.init();
			const onRoute = () => this.routeName = this.router.findCurrentRouteName()!;
			onRoute();
			this.router.subscribe(() => onRoute());
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

		const landingPage = this.findDown(Page);

		if (landingPage !== null) {
			this.resolver.set(landingPage);
			landingPage.render();
		}

		this.resolver
			.subscribe((newPage, { previous }) => {
				if (newPage !== previous) {
					this.page = newPage;
					this.render({ force: true });
				}
			});
	}

	template() {
		return `${this.page}`;
	}
}
