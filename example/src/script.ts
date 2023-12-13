import { Renderer } from '@robertakarobin/web/router.ts';

import { resolver } from '@src/router.ts';

new Renderer(resolver, (page, oldPage) => {
	if (oldPage === undefined) {
		page.hydrate();
	} else {
		oldPage.$el?.replaceWith(page.renderedEl());
	}
});
