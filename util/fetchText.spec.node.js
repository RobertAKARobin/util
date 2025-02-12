import { test } from './spec/index.js';

import { fetchText } from './fetchText.js';

export const spec = test(import.meta.url, async $ => {
	const text = await fetchText(`/util/mock/text.txt`);

	$.assert(x => x(text.trim()) === `hello world`);
});
