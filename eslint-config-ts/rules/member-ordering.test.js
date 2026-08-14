import { RuleTester } from '@typescript-eslint/rule-tester';

import { default as rule } from './member-ordering.js';

const ruleTester = new RuleTester();

ruleTester.run(`member-ordering`, rule, {
	valid: [
		`class Poo {
			aaa;

			static aaa;

			static ['mySignature'];

			#myPrivate = 32;

			_myProtected = 'foo';

			get myProtected() {
				return 'bar';
			}

			set myProtected() {
			}

			['mySignature']() {}
			[42]() {}
			get ['myGetSignature'] (){}

			[myVariable]() {}

			constructor() {}

			static {}
		}`,
	],

	invalid: [],
});
