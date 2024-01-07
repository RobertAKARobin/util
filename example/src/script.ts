import { Page } from '@robertakarobin/web/component.ts';

import { resolver, router } from '@src/router.ts';

router.init();

resolver
	.set(document.querySelector(`[${Page.$pageAttr}]`) as Page)
	.subscribe((newPage, { previous }) => {
		if (newPage !== previous) {
			previous.replaceWith(newPage.render());
		}
	});
