module.exports = {
	env: {
		es6: true,
		node: true,
	},
	overrides: [
		{
			files: [`*.ts`],
			parser: `@typescript-eslint/parser`,
			parserOptions: {
				moduleResolver: __dirname + `/deno-resolver.js`,
			},
		},
	],
};
