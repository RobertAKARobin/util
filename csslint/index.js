module.exports = {
	extends: [
		`stylelint-config-standard`,
		`stylelint-stylistic/config`,
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
		`stylelint-order`,
		`stylelint-stylistic`,
	],
	rules: {
		"alpha-value-notation": `number`,
		"at-rule-empty-line-before": null,
		"color-hex-length": `long`,
		"comment-empty-line-before": null,
		"font-family-name-quotes": `always-unless-keyword`,
		"font-family-no-missing-generic-family-keyword": null,
		"keyframes-name-pattern": null,
		"max-empty-lines": null,
		"max-line-length": null,
		"no-descending-specificity": null,
		"order/properties-alphabetical-order": true,
		"property-no-vendor-prefix": null,
		"selector-class-pattern": /^(?:[-_]?[a-zA-Z0-9]+){1,}$/,
		"selector-pseudo-class-no-unknown": null,
		"shorthand-property-no-redundant-values": null,
		"stylistic/color-hex-case": `lower`,
		"stylistic/indentation": `tab`,
		"stylistic/number-leading-zero": `always`,
		"stylistic/string-quotes": `single`,
	},
};
