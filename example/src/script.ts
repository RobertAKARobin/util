import { Component, Page } from '@robertakarobin/web/component.ts';

import { resolver, router } from '@src/router.ts';

router.init();

const components: Array<Component> = Array.from(
	document.querySelectorAll(`[${Component.const.attrEl}]`)
);

const componentsLoaded = components.map(component =>
	customElements.whenDefined(
		component.getAttribute(Component.const.attrEl)!
	)
);

await Promise.all(componentsLoaded);

const landingPage = document.querySelector(`[${Page.$pageAttr}]`) as Page;

resolver
	.set(landingPage)
	.subscribe((newPage, { previous }) => {
		if (newPage !== previous) {
			previous.replaceWith(newPage.render());
		}
	});

landingPage.render();
