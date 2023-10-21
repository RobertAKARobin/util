module.exports = {
	extends: `stylelint-config-standard`,
	overrides: [
		{
			customSyntax: `postcss-html`,
			files: [
				`**/*.md`,
			],
		},
	],
	plugins: [
		`stylelint-order`,
		`stylelint-stylistic`,
	],
	rules: {
		"alpha-value-notation": `number`,
		"at-rule-empty-line-before": null,
		"color-hex-case": `upper`,
		"color-hex-length": `long`,
		"comment-empty-line-before": null,
		"font-family-name-quotes": `always-unless-keyword`,
		"font-family-no-missing-generic-family-keyword": null,
		"indentation": `tab`,
		"max-empty-lines": null,
		"max-line-length": null,
		"no-descending-specificity": null,
		"number-leading-zero": `never`,
		"order/properties-alphabetical-order": true,
		"property-no-vendor-prefix": null,
		"selector-class-pattern": null,
		"selector-pseudo-class-no-unknown": null,
		"string-quotes": `single`,
	},
};
