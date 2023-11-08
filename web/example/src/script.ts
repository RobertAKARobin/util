import { Page, router } from '@robertakarobin/web/index.ts';

import error from './pages/error.ts';
import nav from './components/nav.ts';
import { resolve } from './routes.ts';

Page.title.subscribe(title => document.title = title);

const $output = document.getElementById(`output`)!;
router.subscribe(async path => {
	$output.innerHTML = await resolve(path) || error();
});
router.onChange();

const $nav = document.querySelector(`nav`);
$nav!.innerHTML = nav();
