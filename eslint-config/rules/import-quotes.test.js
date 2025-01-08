/**
 * @typedef {import('eslint').RuleTester.ValidTestCase} ValidTestCase
 * @typedef {import('eslint').RuleTester.InvalidTestCase} InvalidTestCase
 */

import { quoteCharsByType } from './import-quotes.js';
import rule from './import-quotes.js';
import { RuleTester } from 'eslint';

/**
 * @type {Array<ValidTestCase>}
 */
const valid = [];
/**
 * @type {Array<InvalidTestCase>}
 */
const invalid = [];

/**
 *
 * @param {string} code
 * @param {'double'|'single'} quoteTypeGood
 */
const test = (quoteTypeGood, code) => {
	const quoteTypeBad = quoteTypeGood === `single` ? `double` : `single`;
	const quoteCharGood = quoteCharsByType[quoteTypeGood];
	const quoteCharBad = quoteCharsByType[quoteTypeBad];

	valid.push({
		code,
		options: [quoteTypeGood],
	});

	invalid.push({
		code,
		options: [quoteTypeBad],

		errors: [
			`Use ${quoteTypeBad} quotes in imports`,
		],

		output: code.replaceAll(quoteCharGood, quoteCharBad),
	});
};

test(`single`, `import foo from 'bar'`);
test(`single`, `import { foo } from 'bar' with { type: 'json' }`);
test(`single`, `import { foo as bar } from 'bar'`);
test(`single`, `import {
	foo as bar,
	boo as far,
} from 'bar'`);

test(`double`, `import foo from "bar"`);
test(`double`, `import { foo } from "bar" with { type: "json" }`);
test(`double`, `import { foo as bar } from "bar"`);
test(`double`, `import {
	foo as bar,
	boo as far,
} from "bar"`);

const ruleTester = new RuleTester();
ruleTester.run(`import-quotes`, rule, {
	valid: [
		`const foo = 'bar'`,
		`/* import foo from 'bar' */`,
		`/* import foo from "bar" */`,
		`const foo = require('bar')`,
		`const foo = require("bar")`,

		...valid,
	],

	invalid: [],
});
