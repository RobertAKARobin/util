import nav from './components/nav.ts';
import { router } from './router.ts';

router.setOutlet(document.querySelector(`main`)!);
document.querySelector(`nav`)!.innerHTML = nav();
