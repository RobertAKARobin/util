import { router } from '@robertakarobin/web/index.ts';

import { routes } from './routes.ts';

import * as Error from './src/error/index.ts';
import { splashPage } from './src/splash/index.ts';
import { tenantsPage } from './src/tenants/index.ts';

const $output = document.getElementById(`output`)!;

const resolve = (path: string) => {
	switch (path) {
		case routes.splash:
			return splashPage();
		case routes.tenants:
			return tenantsPage();
		default:
			return Error.error404();
	}
};

router.subscribe(path => {
	$output.innerHTML = resolve(path);
});
