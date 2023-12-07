import { Renderer } from '@robertakarobin/util/router.ts';

import { Nav } from '@src/components/nav.ts';
import { resolver } from '@src/router.ts';

const $nav = document.querySelector(`nav`)!;
const $main = document.querySelector(`main`)!;
new Renderer(resolver, (page, oldPage) => {
	if (oldPage === undefined) {
		const nav = new Nav();
		nav.hydrate($nav);
		page.hydrate($main);
	} else {
		oldPage.$el?.replaceWith(page.rerender());
	}
});
