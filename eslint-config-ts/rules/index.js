export default {
	rules: {
		'member-ordering': (await import(`./member-ordering.js`)).default,
		'no-partial-with-literal': (await import(`./no-partial-with-literal.js`)).default,
	},
};
