import { router } from '@robertakarobin/web/index.ts';

import { resolve } from './routes.ts';

const $output = document.getElementById(`output`)!;
router.subscribe(path => {
	const [title, page] = resolve(path);
	document.title = title;
	$output.innerHTML = page;
});
