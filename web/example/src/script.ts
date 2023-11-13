import { setupForBrowser } from '@robertakarobin/web/index.ts';

import { app } from './app.ts';
import nav from './components/nav.ts';

setupForBrowser(app, document.querySelector(`main`)!);
document.querySelector(`nav`)!.innerHTML = nav();
