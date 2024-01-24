module.exports = {
	extends: [
		`html-validate:recommended`,
	],
	rules: {
		'attribute-boolean-style': `off`, // JSDOM intentionally adds the `=""`, whereas I prefer no value, so may as well just turn this off
		'no-inline-style': `off`,
	},
};
