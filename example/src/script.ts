import { Page } from '@robertakarobin/web/component.ts';

import { resolver } from '@src/router.ts';

const $landingPage = document.querySelector(`[${Page.$pageAttr}]`) as Page;
resolver.set($landingPage);

resolver.subscribe((newPage, { previous }) => {
	if (newPage !== previous) {
		previous.replaceWith(newPage.render());
	}
});
