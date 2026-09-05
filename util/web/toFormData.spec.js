import { test } from '../spec/index.js';

import { toFormData } from './toFormData.js';

export const spec = test(import.meta.url, $ => {
	const data = toFormData({
		age: `42`,
		name: `Alice`,
	});

	$.assert(x => x(data.get(`age`)) === `42`);
	$.assert(x => x(data.get(`name`)) === `Alice`);
	$.assert(x => x([...data.keys()].length) === 2);
});
