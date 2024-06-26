const rule = require(`./no-bang-negation`);
const RuleTester = require(`eslint`).RuleTester;
const messageId = `noBangNegation`;

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: `latest`,
	},
});
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
		`isNo=(   isYes      ==     false )`,
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

function invalid(code, count = 1) {
	return {
		code,
		errors: Array(count).fill({ messageId }),
	};
}
