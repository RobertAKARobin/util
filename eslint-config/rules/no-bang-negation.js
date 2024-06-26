const messageId = `noBangNegation`;

module.exports = {
	meta: {
		docs: {
			description: `Prevents using bang (!) to negate conditions. Based on the opinion that \`(!isYes)\` is significantly harder to read than \`(isYes === false)\``,
		},
		messages: {
			[messageId]: `Don't use bang (!) to negate. Use explicit comparisons instead, e.g. \`=== false\` because it's more readable.`,
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
