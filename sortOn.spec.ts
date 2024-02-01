import { test } from './spec/index.ts';

import { sortOn } from './sortOn.ts';

const items = [
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

const sortedBy = (property: keyof typeof items[number]) => {
	const sorted = sortOn(items, item => item[property]);
	return sorted.map(item => item.name).join(`,`);
};

export const spec = test(`sortOn`, $ => {
	$.assert(x => x(sortedBy(`age`)) === `cat,bob,ali`);
	$.assert(x => x(sortedBy(`name`)) === `ali,bob,cat`);
});
