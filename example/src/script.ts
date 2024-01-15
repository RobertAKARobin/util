import { Component, Page } from '@robertakarobin/web/component.ts';

import { resolver, router } from '@src/router.ts';

router.init();

const landingPage = document.querySelector(`[${Page.$pageAttr}]`) as Page;
const elName = landingPage.getAttribute(Component.const.attrEl)!;
await customElements.whenDefined(elName);

resolver
	.set(landingPage)
	.subscribe((newPage, { previous }) => {
		if (newPage !== previous) {
			previous.replaceWith(newPage.render());
		}
	});
