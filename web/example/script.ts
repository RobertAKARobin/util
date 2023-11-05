import { router, title } from '@robertakarobin/web';

import { resolve } from './routes.ts';

title.subscribe(title => document.title = title);

const $output = document.getElementById(`output`)!;
router.subscribe(async path => {
	$output.innerHTML = await resolve(path);
});
router.onChange();
