import { Renderer, Router } from '@robertakarobin/web/csr.ts';

import { routes } from './routes.ts';

import * as Error from './src/error/index.ts';
import { splashPage } from './src/splash/index.ts';

const renderer = new Renderer(document.getElementById(`output`)!);
const router = new Router(path => {
	if (path.match(routes.splash)) {
		return splashPage();
	}
	return Error.error404();
});

router.subscribe(renderer.render);
router.next(router.route(routes.splash));
