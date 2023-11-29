module.exports = {
	extends: [
		`html-validate:recommended`,
	],
	rules: {
		end_with_newline: true,
		indent_with_tabs: true,
		unformatted: [`script`],
	},
};
