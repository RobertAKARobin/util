import { runContext } from './web/context';
import { test } from './spec/index';
import { tryCatch } from './tryCatch';

import { assert, AssertionError } from './assert';

export const spec = test(import.meta.url, $ => {
	let error: Error;

	$.assert(() => assert(3 === 3) === true);
	$.assert(() => tryCatch(() => assert((3 as number) === 4)) instanceof AssertionError);

	$.log(() => error = tryCatch(() => assert(x => x(3 as number) === x(4))) as AssertionError);
	$.assert(() => error instanceof AssertionError);

	$.assert(x => x(error.message) === (
		runContext === `server`
			? `x=>x(3)===x(4)` // Node likes to remove spaces from around operators in Function.prototype.toString. @see spec.spec.ts
			: `(x) => x(3) === x(4)`
	));

	$.assert(x => x((error as AssertionError).values!.join(`,`)) === `3,4`);

	$.log(() => error = tryCatch(() => assert(() => (null as unknown as string).includes(`a`))) as Error);
	$.assert(x => x(error.name) === `TypeError`);
});
