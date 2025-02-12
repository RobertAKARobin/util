import { test } from '../spec/index.js';

import { arrayFromKeys } from './arrayFromKeys.js';

export const spec = test(import.meta.url, $ => {
	const subject =	{
		alice: 1,
		bob: 2,
		carol: 3,
	};
	$.assert(x => x(arrayFromKeys([`alice`, `carol`], subject).join(` `)) === `1 3`);

});
