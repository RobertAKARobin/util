import nav from './components/nav.ts';
import { resolver } from './router.ts';

resolver.bindTo(document.querySelector(`main`)!);
nav().$el = document.querySelector(`nav`)!;
