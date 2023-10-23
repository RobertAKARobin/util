import { router } from '@robertakarobin/web/index.ts';

import { routes } from './routes.ts';

import * as Error from './src/error/index.ts';
import { splashPage } from './src/splash/index.ts';

const $output = document.getElementById(`output`)!;

const resolve = (path: string) => {
	if (path.match(routes.splash)) {
		return splashPage();
	}
	return Error.error404();
};

router.subscribe(path => {
	$output.innerHTML = resolve(path);
});
