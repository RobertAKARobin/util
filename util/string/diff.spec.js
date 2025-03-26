import { test } from '../spec/index.js';

import { diff as diff_ } from './diff.js';

export const spec = test(import.meta.url, $ => {
	function subject(
		/** @type {string} */origin,
		/** @type {string} */update,
	) {
		console.log($.log(`\n'${origin}' => \n'${update}'`));
		const out = diff_(origin, update, { delimiter: ` ` });
		console.log(out);
		return out;
	}

	let diff = subject(``, ``);
	$.assert(x => x(diff.length) === 0);

	diff = subject(`a b c`, ``);
	$.assert(x => x(diff.length) === 1);
	$.assert(x => x(diff[0].value) === `a b c`);
	$.assert(x => x(diff[0].action) === `removed`);

	diff = subject(``, `a b c`);
	$.assert(x => x(diff.length) === 1);
	$.assert(x => x(diff[0].value) === `a b c`);
	$.assert(x => x(diff[0].action) === `added`);

	diff = subject(`y y a b c d e f`, `a b x x x e f`);
	$.assert(x => x(diff.length) === 5);

	$.assert(x => x(diff[0].value) === `y y`);
	$.assert(x => x(diff[0].action) === `removed`);

	$.assert(x => x(diff[1].value) === `a b`);
	$.assert(x => x(diff[1].action) === ``);

	$.assert(x => x(diff[2].value) === `c d`);
	$.assert(x => x(diff[2].action) === `removed`);

	$.assert(x => x(diff[3].value) === `x x x`);
	$.assert(x => x(diff[3].action) === `added`);

	$.assert(x => x(diff[4].value) === `e f`);
	$.assert(x => x(diff[4].action) === ``);

	// diff = subject(`x x a a b b`, `a a b b x x `);
	// $.assert(x => x(diff.length) === 3);

	// $.assert(x => x(diff[0].value) === `x x `);
	// $.assert(x => x(diff[0].action) === `removed`);

	// $.assert(x => x(diff[1].value) === `a a b b `);
	// $.assert(x => x(diff[1].action) === ``);

	// $.assert(x => x(diff[2].value) === `x x`);
	// $.assert(x => x(diff[2].action) === `added`);

	// from = `a a b b x x`;
	// to = `x x a a b b`;
	// result = diff(from, to, { delimiter: ` ` });

	// $.log(`${from} => ${to}`);

	// $.assert(x => x(result.length) === 3);

	// $.assert(x => x(result[0].value) === `x x `);
	// $.assert(x => x(result[0].action) === `added`);

	// $.assert(x => x(result[1].value) === `a a b b `);
	// $.assert(x => x(result[1].action) === ``);

	// $.assert(x => x(result[2].value) === ` x x`);
	// $.assert(x => x(result[2].action) === `removed`);
});
