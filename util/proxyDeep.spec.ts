/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { test } from './spec/index.ts';

import { proxyDeep } from './proxyDeep.ts';

export const spec = test(import.meta.url, $ => {
	const proxy = proxyDeep(`%`) as any;

	$.assert(x => x(`${proxy}`) === `%`);
	$.assert(x => x(`${proxy.proxy}`) === `%`);
	$.assert(x => x(`${proxy.proxy[42]}`) === `%`);
	$.assert(x => x(`${proxy.proxy[42]()}`) === `%`);
	$.assert(x => x(`${proxy.proxy[42](`ayy`)}`) === `%`);

	let subject: (...args: Array<any>) => string;

	$.log(() => subject = (a: string, b: number, c: string) => `a ${a} b ${(b as any)[42]} c ${(c as any)()}`);
	$.assert(x => x(subject(...(proxyDeep(`$`) as []))) === `a $ b $ c $`);

	$.log(() => subject = ({ param }: { param: string; }) => `a ${param} b ${param}`);
	$.assert(x => x(subject(proxyDeep(`$`))) === `a $ b $`);

	$.log(() => subject = ([ a, [b], [[c]] ]: Array<string>) => `a ${a} b ${b} c ${c}`);
	$.assert(x => x(subject(proxyDeep(`$`))) === `a $ b $ c $`);

	$.log(() => subject = ([{ param }]: Array<{ param: () => string; }>) => `a ${param()}`);
	$.assert(x => x(subject(proxyDeep(`$`))) === `a $`);
});
