module.exports = {
	extends: [
		`@stylistic/stylelint-config`,
	],
	overrides: [
		{
			customSyntax: `postcss-html`,
			files: [
				`**/*.md`,
			],
		},
	],
	plugins: [
		`@stylistic/stylelint-plugin`,
		`stylelint-order`,
	],
	rules: {
		'@stylistic/color-hex-case': `lower`,
		'@stylistic/indentation': `tab`,
		'@stylistic/max-empty-lines': null,
		'@stylistic/max-line-length': null,
		'@stylistic/number-leading-zero': `always`,
		'@stylistic/string-quotes': `single`,
		'alpha-value-notation': `number`,
		'at-rule-empty-line-before': null,
		'color-hex-length': `long`,
		'comment-empty-line-before': null,
		'custom-property-empty-line-before': null,
		'custom-property-pattern': null,
		'declaration-empty-line-before': null,
		'font-family-name-quotes': `always-unless-keyword`,
		'font-family-no-missing-generic-family-keyword': null,
		'keyframes-name-pattern': null,
		'no-descending-specificity': null,
		'order/properties-alphabetical-order': true,
		'property-no-vendor-prefix': null,
		'selector-class-pattern': /^(?:[-_]?[a-zA-Z0-9]+){1,}$/,
		'selector-pseudo-class-no-unknown': null,
		'shorthand-property-no-redundant-values': null,
	},
};
