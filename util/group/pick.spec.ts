import { test } from '../spec/index.ts';

import { keysOf } from './keysOf.ts';
import { pick } from './pick.ts';

const data = {
	age: 42,
	job: {
		employer: `Joes`,
		title: `Chef`,
	},
	name: `Alice`,
};

export const spec = test(import.meta.url, $ => {
	const subject = pick(data, `age`, `name`);
	$.assert(x => x(keysOf(subject).join(`,`)) === `age,name`);
	$.assert(x => x(JSON.stringify(subject)) === `{"age":42,"name":"Alice"}`);
});
