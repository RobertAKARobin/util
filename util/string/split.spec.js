import { suite, test } from '../spec/index.js';

import { split } from './split.js';

export const spec = suite(import.meta.url, {},
	test(`split is same as standard String.split`, $ => {
		const subject = `aa</>bb</></>cc</></></>`;

		const result = split(subject, (index, subject) =>
			subject.substring(index).startsWith(`</>`) ? 3 : void 0,
		);

		const standard = subject.split(`</>`);
		$.assert(x => x(result.length) === x(standard.length));
		$.assert(x => x(result.length) === 7);
		$.assert(x => x(result.join(`%`)) === x(standard.join(`%`)));

		$.assert(x => x(result[0]) === `aa`);
		$.assert(x => x(result[1]) === `bb`);
		$.assert(x => x(result[2]) === ``);
		$.assert(x => x(result[3]) === `cc`);
		$.assert(x => x(result[4]) === ``);
		$.assert(x => x(result[5]) === ``);
		$.assert(x => x(result[6]) === ``);
	}),

	test(`split before delimiter`, $ => {
		const result = split(`aa</>bb</></>cc</></></>`, (index, subject) =>
			subject.substring(index).startsWith(`</>`) ? 0 : void 0,
		);

		$.assert(x => x(result.length) === 7);
		$.assert(x => x(result[0]) === `aa`);
		$.assert(x => x(result[1]) === `</>bb`);
		$.assert(x => x(result[2]) === `</>`);
		$.assert(x => x(result[3]) === `</>cc`);
		$.assert(x => x(result[4]) === `</>`);
		$.assert(x => x(result[5]) === `</>`);
		$.assert(x => x(result[6]) === `</>`);
	}),

	test(`split after delimiter`, $ => {
		const result = split(`aa</>bb</></>cc</></></>`, (index, subject) =>
			subject.substring(index - 3, index) === `</>` ? 0 : void 0,
		);

		$.assert(x => x(result.length) === 6);
		$.assert(x => x(result[0]) === `aa</>`);
		$.assert(x => x(result[1]) === `bb</>`);
		$.assert(x => x(result[2]) === `</>`);
		$.assert(x => x(result[3]) === `cc</>`);
		$.assert(x => x(result[4]) === `</>`);
		$.assert(x => x(result[5]) === `</>`);
	}),

	test(`start with delimiter`, $ => {
		const result = split(`</>aa</>bb</></>cc</></></>`, (index, subject) =>
			subject.substring(index - 3, index) === `</>` ? 0 : void 0,
		);

		$.assert(x => x(result.length) === 7);
		$.assert(x => x(result[0]) === `</>`);
		$.assert(x => x(result[1]) === `aa</>`);
		$.assert(x => x(result[2]) === `bb</>`);
		$.assert(x => x(result[3]) === `</>`);
		$.assert(x => x(result[4]) === `cc</>`);
		$.assert(x => x(result[5]) === `</>`);
		$.assert(x => x(result[6]) === `</>`);
	}),

	test(`only delimiter`, $ => {
		const result = split(`</>`, (index, subject) =>
			subject.substring(index - 3, index) === `</>` ? 0 : void 0,
		);

		$.assert(x => x(result.length) === 1);
		$.assert(x => x(result[0]) === `</>`);
	}),

	test(`no delimiter match`, $ => {
		const result = split(`abc`, (index, subject) =>
			subject.substring(index - 3, index) === `</>` ? 0 : void 0,
		);

		$.assert(x => x(result.length) === 1);
		$.assert(x => x(result[0]) === `abc`);
	}),
);
