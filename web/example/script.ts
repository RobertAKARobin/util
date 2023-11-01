import { router } from '@robertakarobin/web';

import { resolve } from './routes.ts';

const $output = document.getElementById(`output`)!;
router.subscribe(async path => {
	$output.innerHTML = await resolve(path);
});
