import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from './no-partial-with-literal.js';

const ruleTester = new RuleTester();

// TODO3: More tests

/**
 * @param {string} code
 */
function valid(code) {
	return {
		code,
	};
}

/**
 * @param {string} code
 */
function invalid(code) {
	/**
	 * @type {keyof typeof rule.meta.messages}
	 */
	const messageId = `noPartialWithLiteral`;
	return {
		code,
		errors: [{ messageId }],
	};
};

ruleTester.run(`no-partial-with-literal`, rule, {
	valid: [
		`type myType = Partial<MyInterface>`,
	].map(valid),

	invalid: [
		`type myType = Partial<{ myProp: string; }>`,
		`type myType = Partial<MyInterface & { myProp: string }>`,
		`function myFunction(input: Partial<{ myProp: string; }>) {}`,
		`const myConst: Partial<{ myProp: string }> = {}`,
	].map(invalid),
});
