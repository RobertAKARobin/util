import { dateFormatYYYYMMDD } from './dateFormat';
import { test } from '../spec/index';

export const spec = test(import.meta.url, $ => {
	const now = new Date();
	now.setFullYear(2001);
	now.setMonth(2);
	now.setDate(15);

	$.assert(x => x(dateFormatYYYYMMDD(now).join(`-`)) === `2001-03-15`);
});
