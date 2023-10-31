import { router } from '@robertakarobin/web/index.ts';

import { resolve } from './routes.ts';

const $output = document.getElementById(`output`)!;
router.subscribe(path => {
	$output.innerHTML = resolve({
		path,
		routerContext: `client`,
	});
});
