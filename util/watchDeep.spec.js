/**
 * @import { WatchDeepReport } from './watchDeep.js';
 */

import { test } from './spec/index.js';

import { watchDeep } from './watchDeep.js';

export const spec = test(import.meta.url, $ => {
	const data = {
		grand: {
			parent: {
				child: 42,
			},
		},
	};

	/** @type {WatchDeepReport<typeof data>} */
	let lastGet;
	/** @type {WatchDeepReport<typeof data>} */
	let lastSet;

	const subject = watchDeep(data, {
		onGet(change) {
			lastGet = change;
			return change.value;
		},
		onSet(change) {
			lastSet = change;
			return change.value;
		},
	});

	$.assert(() => subject !== data);
	$.assert(x => x(JSON.stringify(subject)) === x(JSON.stringify(data)));

	$.assert(x => x(lastGet.property) === `child`);
	$.assert(x => x(lastGet.value) === 42);
	$.assert(x => x(lastSet) === undefined);

	subject.grand.parent.child = 43;
	$.assert(x => x(lastGet.property) === `parent`);
	$.assert(x => x(lastSet.property) === `child`);
	$.assert(x => x(lastSet.value) === 43);

	const childOld = subject.grand.parent.child;

	subject.grand.parent = {
		child: 44,
	};
	$.assert(x => x(lastSet.property) === `parent`);
	$.assert(() => subject.grand.parent.child !== childOld);

	subject.grand.parent.child = 45;
	$.assert(x => x(lastGet.property) === `parent`);
	$.assert(x => x(lastSet.property) === `child`);
	$.assert(x => x(lastSet.value) === 45);
});
