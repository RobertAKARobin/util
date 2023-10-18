import { FunctionCache } from '../src/function-cache.ts';

import * as Button from './src/button.ts';

declare global {
	interface Window {
		fn: FunctionCache;
	}
}

const cache = new FunctionCache(`fn`, { binding: window });

const $output = document.getElementById(`output`)!;
$output.innerHTML = Button.template(cache);
