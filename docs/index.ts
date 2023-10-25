import { router } from '@robertakarobin/web/index.ts';

import { routes } from './routes.ts';

import * as Error from './pages/error.ts';
import { homePage } from './pages/home.ts';

const $output = document.getElementById(`output`)!;

const resolve = (path: string) => {
	switch (path) {
		case routes.home:
			return homePage();
		default:
			return Error.error404();
	}
};

router.subscribe(path => {
	$output.innerHTML = resolve(path);
});
