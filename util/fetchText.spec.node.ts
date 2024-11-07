import { test } from './spec/index.ts';

import { fetchText } from './fetchText.ts';

export const spec = test(import.meta.url, async $ => {
	const text = await fetchText(`/util/mock/text.txt`);

	$.assert(x => x(text.trim()) === `hello world`);
});
