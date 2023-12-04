import { Renderer } from '@robertakarobin/jsutil/router.ts';

import { Nav } from '@src/components/nav.ts';
import { resolver } from '@src/router.ts';

const $nav = document.querySelector(`nav`)!;
const $main = document.querySelector(`main`)!;
new Renderer(resolver, (view, oldView) => {
	if (oldView === undefined) {
		const nav = new Nav();
		nav.hydrate($nav);
		view.hydrate($main);
	} else {
		view.setEl(oldView.$el as Element);
		view.rerender();
	}
});
