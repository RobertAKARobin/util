export default {
	rules: {
		'no-partial-with-literal': (await import(`./no-partial-with-literal.js`)).default,
	},
};
