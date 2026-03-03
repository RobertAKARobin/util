/**
 * @import { BookOrderOptions } from './bookorder.js';
 */

import { suite, test } from '../spec/index.js';

import { tryCatch } from '../tryCatch.js';
import { tsvParse } from '../tsvParse.js';

import { bookOrder } from './bookorder.js';

/**
 * @param {number} pages
 * @param {BookOrderOptions} options
 * @ignore
 */
function subject(pages, options = {}) {
	const signatures = bookOrder(pages, options).map(signature => ({
		folds: signature.map(fold => ({
			pages: fold,
		})),
	}));

	return {
		signatures,
		text: signatures.map(signature =>
			signature.folds.map(fold =>
				fold.pages.join(`,`),
			).join(` < `),
		).join(` | `),
	};
}

const inputsBad = [0, 0.1, -1, 1.1, Infinity];
const inputsGood = [1, 3, 12, 13];

export const spec = suite(import.meta.url, {},
	test(`invalid number of pages throws error`, $ => {
		inputsBad.forEach(inputBad => {
			$.assert(x => tryCatch(() => bookOrder(x(inputBad))) instanceof Error);

			inputsGood.forEach(inputGood => {
				$.assert(x => tryCatch(() =>
					bookOrder(x(inputBad), { foldsPerSignature: x(inputGood) }),
				) instanceof Error);
			});
		});
	}),

	test(`invalid foldsPerSignature throws error`, $ => {
		inputsBad.forEach(inputBad => {
			inputsGood.forEach(pages => {
				$.assert(x => tryCatch(() =>
					bookOrder(x(pages), { foldsPerSignature: x(inputBad) }),
				) instanceof Error);
			});
		});
	}),

	test(`returns one signature if foldsPerSignature not specified`, $ => {
		inputsGood.forEach(pages => {
			$.assert(x => subject(x(pages)).signatures.length === 1);
		});
	}),

	test(`returns enough signatures to accommodate foldsPerSignature`, $ => {
		inputsGood.forEach(pages => {
			inputsGood.forEach(foldsPerSignature => {
				$.log({ foldsPerSignature, pages });

				const book = subject(pages, { foldsPerSignature });

				$.assert(x =>
					x(book.signatures.length) === x(Math.ceil(pages / foldsPerSignature / 2)),
				);
			});
		});
	}),

	suite(`returns expected sequence`, {},
		...tsvParse(`
			1	NaN	0,1
			1	1	0,1
			1	3	0,5 < 1,4 < 2,3
			1	5	0,9 < 1,8 < 2,7 < 3,6 < 4,5
			2	NaN	0,1
			2	1	0,1
			2	2	0,3 < 1,2
			2	3	0,5 < 1,4 < 2,3
			3	NaN	0,3 < 1,2
			3	1	0,1 | 2,3
			3	2	0,3 < 1,2
			3	3	0,5 < 1,4 < 2,3
			5	NaN	0,5 < 1,4 < 2,3
			5	1	0,1 | 2,3 | 4,5
			5	2	0,3 < 1,2 | 4,7 < 5,6
			5	3	0,5 < 1,4 < 2,3
			7	4	0,7 < 1,6 < 2,5 < 3,4
			9	NaN	0,9 < 1,8 < 2,7 < 3,6 < 4,5
			9	1	0,1 | 2,3 | 4,5 | 6,7 | 8,9
			9	2	0,3 < 1,2 | 4,7 < 5,6 | 8,11 < 9,10
			9	3	0,5 < 1,4 < 2,3 | 6,11 < 7,10 < 8,9
		`, line => ({
			options: {
				foldsPerSignature: (
					parseInt(line[1])
					|| (/** @type {number} */(/** @type {unknown} */(null)))
				),
			},
			pages: parseInt(line[0]),
			text: line[2],
		}), { trimStart: true }).map(({ pages, options, text }) =>
			test(JSON.stringify({ pages, ...options }), $ => {
				$.assert(x => x(subject(pages, options).text) === x(text));
			}),
		),
	),
);
