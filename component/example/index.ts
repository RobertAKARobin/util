import { AsyncRenderer } from 'component/src/renderer.ts';
import { Router } from 'component/src/router.ts';

import { routes } from './routes.ts';

import * as Error from './src/error/index.ts';
import { SplashPage } from './src/splash/index.ts';

const renderer = new AsyncRenderer(document.getElementById(`output`)!);
const router = new Router((path) => {
	if (path.match(routes.splash)) {
		return new SplashPage();
	}
	return new Error.Error404();
});

router.subscribe(renderer.render);
router.next(router.route(routes.splash));
