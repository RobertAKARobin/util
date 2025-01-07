/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('estree').BaseNode} BaseNode
 */

export const quoteCharsByType = {
	double: `"`,
	single: `'`,
};

/**
 * Cribbed from https://www.npmjs.com/package/eslint-plugin-import-quotes, which is small and not actively maintained
 * @type RuleModule
 */
export default {
	meta: {
		docs: {
			description: `Allow only double|single quotes in imports`,
		},
		fixable: `code`,
		schema: [
			{
				enum: [
					`double`,
					`single`,
				],
			},
		],
		type: `suggestion`,
	},

	create(context) {
		/**
		 * @type {[
		 * 	'double'|'single'
		 * ]}
		 */
		// @ts-expect-error TODO3 Can't figure out how to cast `any[]` to tuple
		const options = context.options;
		const quoteTypeGood = options[0] ?? `single`;
		const quoteTypeBad = quoteTypeGood === `single` ? `double` : `single`;
		const quoteCharGood = quoteCharsByType[quoteTypeGood];
		const quoteCharBad = quoteCharsByType[quoteTypeBad];

		const sourceCode = context.sourceCode;
		return {
			Program: program => program.body.forEach(node => {
				if (
					node.type === `ImportDeclaration`
					&& node.source.raw !== undefined
					&& node.source.raw.includes(quoteCharBad)
				) {
					context.report({
						message: `Use ${quoteTypeGood} quotes in imports`,
						node,

						fix: fixer => fixer.replaceText(
							node,
							sourceCode
								.getText(node)
								.replaceAll(quoteCharBad, quoteCharGood),
						),
					});
				}
			}),
		};
	},
};
