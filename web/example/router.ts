import { Router } from '@robertakarobin/web/csr.ts';

import { routes } from './routes.ts';

import * as Error from './src/error/index.ts';
import { splashPage } from './src/splash/index.ts';

export const router = new Router(path => {
	if (path.match(routes.splash)) {
		return splashPage();
	}
	return Error.error404();
});
