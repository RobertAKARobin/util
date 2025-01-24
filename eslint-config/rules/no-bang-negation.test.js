import rule from './no-bang-negation.js';
import { RuleTester } from 'eslint';

const messageId = `noBangNegation`;

/**
 * @param {string} code
 * @param {number} countOfErrors
 */
function invalid(code, countOfErrors = 1) {
	return {
		code,
		errors: Array(countOfErrors).fill({ messageId }),
	};
}

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
		invalid(`isNo = !isYes`),
		invalid(`isYes && !isYes`),
		invalid(`isYes && !isYes && (!((isYes)))`, 2),
		invalid(`!isYes
			&& !isYes
			|| (!((isNo)))`, 3),
		invalid(`var foo = \`3\${!isYes}\``),
	],
});
