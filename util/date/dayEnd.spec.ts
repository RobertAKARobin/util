import { dayEnd, dayStart } from './dayEnd.ts';
import { test } from '../spec/index.ts';

export const spec = test(import.meta.url, $ => {
	const now = new Date();
	now.setFullYear(2001);
	now.setMonth(2);
	now.setDate(15);

	$.assert(x => x(dayEnd(now).getFullYear()) === 2001);
	$.assert(x => x(dayEnd(now).getMonth()) === 2);
	$.assert(x => x(dayEnd(now).getDate()) === 15);
	$.assert(x => x(dayEnd(now).getHours()) === 23);
	$.assert(x => x(dayEnd(now).getMinutes()) === 59);
	$.assert(x => x(dayEnd(now).getSeconds()) === 59);
	$.assert(x => x(dayEnd(now).getMilliseconds()) === 999);

	$.assert(x => x(dayStart(now).getFullYear()) === 2001);
	$.assert(x => x(dayStart(now).getMonth()) === 2);
	$.assert(x => x(dayStart(now).getDate()) === 15);
	$.assert(x => x(dayStart(now).getHours()) === 0);
	$.assert(x => x(dayStart(now).getMinutes()) === 0);
	$.assert(x => x(dayStart(now).getSeconds()) === 0);
	$.assert(x => x(dayStart(now).getMilliseconds()) === 0);
});
