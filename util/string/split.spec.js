import { test } from '../spec/index.js';

import { split } from './split.js';

export const spec = test(import.meta.url, $ => {
	const subject = `aa bb cc`;
	const result = split(subject, index => {
		const nextCharacter = subject[index];
		if (nextCharacter === ` `) {
			return [index, 1];
		}

		return void 0;
	});

	$.assert(x => x(result.length) === 3);
	$.assert(x => x(result[0]) === `aa`);
	$.assert(x => x(result[1]) === `bb`);
	$.assert(x => x(result[2]) === `cc`);
});
