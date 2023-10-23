import { Renderer } from '@robertakarobin/web/csr.ts';

import { router } from './router.ts';
import { routes } from './routes.ts';

const renderer = new Renderer(document.getElementById(`output`)!);
router.subscribe(renderer.render);
router.next(router.route(routes.splash));
