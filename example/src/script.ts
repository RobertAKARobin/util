import { Renderer } from '@robertakarobin/web/router.ts';

import { modalContainer } from '@src/state.ts';
import { resolver } from '@src/router.ts';

new Renderer(resolver, (page, oldPage) => {
	if (oldPage === undefined) {
		page.hydrate();
	} else {
		oldPage.$el.replaceWith(page.render());
	}
});

document.body.appendChild(modalContainer.render());
