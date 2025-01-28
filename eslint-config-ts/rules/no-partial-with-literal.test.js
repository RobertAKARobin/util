import { RuleTester } from '@typescript-eslint/rule-tester';

import { messageId, default as rule } from './no-partial-with-literal.js';

const ruleTester = new RuleTester();

// TODO3: More tests

ruleTester.run(`no-partial-with-literal`, rule, {
	valid: [
		`type myType = Partial<MyInterface>`,
	],

	invalid: [
		{
			code: `type myType = Partial<{ myProp: string; }>`,
			errors: [{ messageId }],
		},

		{
			code: `type myType = Partial<MyInterface & { myProp: string }>`,
			errors: [{ messageId }],
		},

		{
			code: `function myFunction(input: Partial<{ myProp: string; }>) {}`,
			errors: [{ messageId }],
		},

		{
			code: `const myConst: Partial<{ myProp: string }> = {}`,
			errors: [{ messageId }],
		},
	],
});
