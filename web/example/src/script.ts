import { Renderer } from '@robertakarobin/jsutil/router.ts';

import nav from '@src/components/nav.ts';
import { resolver } from '@src/router.ts';

const $nav = document.querySelector(`nav`)!;
$nav.innerHTML = nav();

const $main = document.querySelector(`main`)!;
new Renderer(resolver, view => {
	$main.innerHTML = view.render();
});
