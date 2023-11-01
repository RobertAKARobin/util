import { router } from '@robertakarobin/web/index.ts';

import { resolve } from './routes.ts';

const $output = document.getElementById(`output`)!;
router.subscribe(async path => {
	$output.innerHTML = await resolve(path);
});
