/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { test } from './spec/index.js';

import { proxyDeep } from './proxyDeep.js';

export const spec = test(import.meta.url, $ => {
	const proxy = /** @type {any} */(proxyDeep(`%`));

	$.assert(x => x(`${proxy}`) === `%`);
	$.assert(x => x(`${proxy.proxy}`) === `%`);
	$.assert(x => x(`${proxy.proxy[42]}`) === `%`);
	$.assert(x => x(`${proxy.proxy[42]()}`) === `%`);
	$.assert(x => x(`${proxy.proxy[42](`ayy`)}`) === `%`);

	/** @type {(...args: Array<any>) => string} */
	let subject;

	$.log(() => subject = (a, b, c) => `a ${a} b ${(b)[42]} c ${(c)()}`);
	$.assert(x => x(subject(...(proxyDeep(`$`)))) === `a $ b $ c $`);

	$.log(() => subject = ({ param }) => `a ${param} b ${param}`);
	$.assert(x => x(subject(proxyDeep(`$`))) === `a $ b $`);

	$.log(() => subject = ([ a, [b], [[c]] ]) => `a ${a} b ${b} c ${c}`);
	$.assert(x => x(subject(proxyDeep(`$`))) === `a $ b $ c $`);

	$.log(() => subject = ([{ param }]) => `a ${param()}`);
	$.assert(x => x(subject(proxyDeep(`$`))) === `a $`);
});
