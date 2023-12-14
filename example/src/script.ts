import { Renderer } from '@robertakarobin/web/router.ts';

import { modalContainer } from './state.ts';
import { resolver } from '@src/router.ts';

new Renderer(resolver, (page, oldPage) => {
	if (oldPage === undefined) {
		page.hydrate();
	} else {
		page.replace(oldPage);
	}
	page.$el?.appendChild(modalContainer.renderedEl());
});
