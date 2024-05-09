import { test } from '../spec/index.ts';

import { arrayFromKeys } from './arrayFromKeys.ts';

export const spec = test(import.meta.url, $ => {
	const subject = 	{
		alice: 1,
		bob: 2,
		carol: 3,
	};
	$.assert(x => x(arrayFromKeys([`alice`, `carol`], subject).join(` `)) === `1 3`);

});
