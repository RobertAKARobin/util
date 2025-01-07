export default {
	rules: {
		'import-quotes': (await import(`./import-quotes.js`)).default,
		'no-bang-negation': (await import(`./no-bang-negation.js`)).default,
	},
};
