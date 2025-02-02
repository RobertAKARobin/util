// import { runContext } from './web/context';
import { test } from './spec/index';
import { tryCatch } from './tryCatch';

import { assert, AssertionError } from './assert';

export const spec = test(import.meta.url, $ => {
	/** @type {Error} */
	let error;

	const three = /** @type {number} */(3);

	$.assert(() => assert(3 === 3) === true);
	$.assert(() => tryCatch(() => assert(three === 4)) instanceof AssertionError);

	$.log(() => error = /** @type {Error} */(tryCatch(() => assert(x => x(three) === x(4)))));
	$.assert(() => error instanceof AssertionError);

	// TODO1: Why no bueno?
	// $.assert(x => x(error.message) === (
	// 	runContext === `server`
	// 		? `x=>xthree===x(4)` // Node likes to remove spaces from around operators in Function.prototype.toString. @see spec.spec.ts
	// 		: `(x) => x(three) === x(4)`
	// ));

	$.assert(x => x(/** @type {AssertionError} */(error).values?.join(`,`)) === `3,4`);

	const notAString = /** @type {string} */(/** @type {unknown} */(null));
	$.log(() => error = /** @type {Error} */(tryCatch(() => assert(() => notAString.includes(`a`)))));
	$.assert(x => x(error.name) === `TypeError`);
});
