import { FunctionCache } from '../../src/function-cache.ts';

import * as Button from '../components/button/index.ts';
import * as Styles from '../styles/index.css.ts';

declare global {
	interface Window {
		fn: FunctionCache;
	}
}

const cache = new FunctionCache(`fn`, { binding: window });

const $output = document.getElementById(`output`)!;
$output.innerHTML = Button.template(cache);

const $style = document.createElement(`style`);
$style.textContent = Styles.base();
document.head.appendChild($style);
