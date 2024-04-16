import { ampmToDate } from './ampmToDate.ts';
import { test } from '../spec/index.ts';

export const spec = test(`ampmToDate`, $ => {
	const now = new Date();
	now.setFullYear(2001);
	now.setMonth(2);
	now.setDate(15);

	$.assert(x => x(ampmToDate(`8:01am`, now).getHours()) === 8);
	$.assert(x => x(ampmToDate(`08:01am`, now).getHours()) === 8);
	$.assert(x => x(ampmToDate(`8:01am`, now).getMinutes()) === 1);

	$.assert(x => x(ampmToDate(`8:01pm`, now).getHours()) === 20);
	$.assert(x => x(ampmToDate(`08:01pm`, now).getHours()) === 20);
	$.assert(x => x(ampmToDate(`8:01pm`, now).getMinutes()) === 1);

	$.assert(x => x(ampmToDate(`0:00am`, now).getHours()) === 0);
	$.assert(x => x(ampmToDate(`12:00am`, now).getHours()) === 0);
	$.assert(x => x(ampmToDate(`12:00pm`, now).getHours()) === 12);

	$.assert(x => x(ampmToDate(`13:00am`, now).getHours()) === 13);
	$.assert(x => x(ampmToDate(`13:00pm`, now).getHours()) === 1);
});
