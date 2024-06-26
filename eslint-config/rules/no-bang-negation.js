const messageId = `noBangNegation`;

module.exports = {
	meta: {
		docs: {
			description: `Prevents using bang (!) to negate conditions. Based on the opinion that \`(!isYes)\` is significantly harder to read than \`(isYes === false)\``,
		},
		messages: {
			[messageId]: `Don't use bang (!) to negate. It can be hard to read. Use explicit comparisons instead, e.g. \`=== false\`, or change the variable name to be negative.`,
		},
		type: `suggestion`,
	},

	create: function(context) {
		return {
			UnaryExpression(node) {
				if (node.operator === `!`) {
					context.report({
						messageId,
						node,
					});
				}
			},
		};
	},
};
