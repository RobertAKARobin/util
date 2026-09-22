import { test } from '../spec/index.js';

import { color, colors } from './colors.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(color(`foo`, `invert`, `blue`)) === `\x1b[7;34mfoo\x1b[0m`);
	$.assert(x => x(color(`foo`, `invert`)) === x(`${colors.invert}foo${colors.reset}`));
});
