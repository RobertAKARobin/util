import { Renderer } from '@robertakarobin/jsutil/router.ts';

// import { nav } from '@src/components/nav.ts';
import { resolver } from '@src/router.ts';

// const $nav = document.querySelector(`nav`)!;
const $main = document.querySelector(`main`)!;
new Renderer(resolver, (view, oldView) => {
	if (oldView === undefined) {
		// $nav.innerHTML = nav(); // TODO1: Hydrate
		// $main.innerHTML = view.render(); // TODO1: Have to come back to this later for hydration; would require putting args on all descendants
		view.hydrate($main);
	} else {
		$main.innerHTML = view.render();
	}
});
