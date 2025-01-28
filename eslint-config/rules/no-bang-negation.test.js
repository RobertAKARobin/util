import { RuleTester } from 'eslint';

import { messageId, default as rule } from './no-bang-negation.js';

const ruleTester = new RuleTester();
ruleTester.run(`no-bang-negation`, rule, {
	valid: [
		`isNo = isYes == false`,
		`isNo =isYes == false`,
		`isNo= isYes == false`,
		`isNo=isYes == false`,
		`isNo=isYes== false`,
		`isNo=isYes==false`,

		`isNo = isYes === false`,

		`isNo = (isYes == false)`,
		`isNo = (isYes === false)`,
		`isNo = (((isYes == false)))`,
		`isNo = (((isYes === false)))`,

		`isNo = (   isYes      ==     false )`,
		`isNo=(   isYes      ==     false )`,
		`isNo= (   isYes      ==     false )`,
		`isNo =(   isYes      ==     false )`,
		`isNo=(
			isYes      ==
			false
		)`,

		`isNo = isYes != isYes`,
		`isNo = isYes !== isYes`,

		`isNo: isYes === false`,
		`isNo:isYes===false`,
		`isNo:isYes!=isYes`,
	],

	invalid: [
		{
			code: `isNo = !isYes`,
			errors: [{ messageId }],
		},
		{
			code: `isYes && !isYes`,
			errors: [{ messageId }],
		},
		{
			code: `isYes && !isYes && (!((isYes)))`,
			errors: [{ messageId }, { messageId }],
		},
		{
			code: `!isYes
			 	&& !isYes
			 	|| (!((isNo)))`,
			errors: [{ messageId }, { messageId }, { messageId }],
		},
		{
			code: `var foo = \`3\${!isYes}\``,
			errors: [{ messageId }],
		},
	],
});
