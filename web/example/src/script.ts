import { Page, router } from '@robertakarobin/web/index.ts';

import error from './pages/error.ts';
import { resolve } from './routes.ts';

Page.title.subscribe(title => document.title = title);

const $output = document.getElementById(`output`)!;
router.subscribe(async path => {
	let page = await resolve(path);
	if (typeof page !== `string`) {
		page = error();
	}
	$output.innerHTML = page;
});
router.onChange();
