import { test } from '../spec/index.ts';

import { sortOn } from './sortOn.ts';

const subject = [
	{
		age: 30,
		name: `ali`,
	},
	{
		age: 20,
		name: `bob`,
	},
	{
		age: 10,
		name: `cat`,
	},
];

export const spec = test(import.meta.url, $ => {
	let originalValues = subject.map(i => i.name).join(`,`);
	let sorted = subject.sort(sortOn(i => i.age));
	let sortedValues = sorted.map(i => i.name).join(`,`);

	$.assert(() => subject === sorted);
	$.assert(x => x(originalValues) === `ali,bob,cat`);
	$.assert(x => x(sortedValues) === `cat,bob,ali`);
	$.assert(x => x(subject.map(i => i.name).join(`,`)) !== x(originalValues));

	$.log(() => originalValues = subject.map(i => i.name).join(`,`));
	$.log(() => sorted = [...subject].sort(sortOn(i => i.name)));
	$.log(() => sortedValues = sorted.map(i => i.name).join(`,`));
	$.assert(() => subject !== sorted);
	$.assert(x => x(originalValues) === `cat,bob,ali`);
	$.assert(x => x(sortedValues) === `ali,bob,cat`);
});
