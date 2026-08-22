import { RuleTester } from '@typescript-eslint/rule-tester';

import { messageId, default as rule } from './member-ordering.js';

const ruleTester = new RuleTester();

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

	myMethodProperty = () => {}
}`;

ruleTester.run(`member-ordering`, rule, {
	valid: [
		`class Foo {
			static aaa;
			static _BBB;
			static #BBB;
			static get BBB(){}
			static set BBB(){}
			static zzz;

			static {}

			static aaa(){}
			static BBB(){}
			static zzz(){}

			aaa;
			_BBB;
			#BBB;
			get BBB(){}
			set BBB(){}
			zzz;

			constructor(){}

			aaa(){}
			BBB(){}
			zzz(){}
		}`,
	],

	invalid: [
		{
			code: `class Foo { static zzz; static aaa; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { zzz; static aaa; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { get aaa(){}; #aaa; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { get aaa(){}; _aaa; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { set aaa(){}; get aaa(){}; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { static {}; static aaa; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { static aaa(){}; static {}; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { constructor(){}; aaa; }`,
			errors: [{ messageId }],
		},

		{
			code: `class Foo { aaa(){}; constructor(){}; }`,
			errors: [{ messageId }],
		},
	],
});
