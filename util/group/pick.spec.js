import { test } from '../spec/index.js';

import { keysOf } from './keysOf.js';
import { pick } from './pick.js';

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
