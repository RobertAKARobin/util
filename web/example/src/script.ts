import nav from '@src/components/nav.ts';
import { router } from '@src/router.ts';

const $nav = document.querySelector(`nav`)!;
$nav.innerHTML = nav();

const $main = document.querySelector(`main`)!;
router.setOutlet($main);
