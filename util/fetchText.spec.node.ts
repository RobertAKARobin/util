import { test } from './spec/index';

import { fetchText } from './fetchText';

export const spec = test(import.meta.url, async $ => {
	const text = await fetchText(`/util/mock/text.txt`);

	$.assert(x => x(text.trim()) === `hello world`);
});
