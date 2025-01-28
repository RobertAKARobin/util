/**
 * @typedef {import('@typescript-eslint/types').TSESTree.TypeNode} TypeNode
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

export const messageId = /** @type {const} */`noPartialWithLiteral`;

export default ESLintUtils.RuleCreator.withoutDocs({
	defaultOptions: [],
	meta: {
		docs: {
			description: `Quick n' dirty. Reports when using Partial<> with an object literal (e.g. Partial<{foo: string}>)`,
		},
		messages: {
			[messageId]: `Instead of using Partial<>, consider using optional properties since it's more explicit`,
		},
		schema: [],
		type: `suggestion`,
	},

	create(context) {
		/**
		 * @param {TypeNode} node
		 */
		function ifIsTypeLiteral(node) {
			if (node.type === AST_NODE_TYPES.TSTypeLiteral) {
				context.report({
					messageId: `noPartialWithLiteral`,
					node,
				});
			}
		}

		return {
			TSTypeReference(node) {
				if (
					`name` in node.typeName
					&& node.typeName.name === `Partial`
				) {
					for (const member of node.typeArguments?.params ?? []) {
						if (member.type === AST_NODE_TYPES.TSTypeLiteral) {
							ifIsTypeLiteral(member);
						} else if (`types` in member) {
							for (const type of member.types) {
								ifIsTypeLiteral(type);
							}
						}
					}
				}
			},
		};
	},
});
