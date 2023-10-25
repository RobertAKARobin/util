import { router } from '@robertakarobin/web/index.ts';

import { routes } from './routes.ts';

import * as Error from './pages/error.ts';
import { splashPage } from './pages/splash.ts';
import { tenantsPage } from './pages/tenants.ts';

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
