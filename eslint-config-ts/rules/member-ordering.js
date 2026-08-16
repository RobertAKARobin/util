/**
 * @import {TSESTree} from '@typescript-eslint/types';
 * @import {Nested} from '../../util/types';
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

import { sortOn } from '../../util/group/sortOn.js';

export const messageId = /** @type {const} */`memberOrdering`;

/**
 * @typedef {{
 * 	accessibility?: TSESTree.Accessibility
 * 	key?: TSESTree.Identifier | TSESTree.Literal;
 * 	kind?: TSESTree.MethodDefinition['kind'] | TSESTree.Property['kind']
 * 	static?: boolean;
 * 	type: TSESTree.AST_NODE_TYPES;
 * 	value?: TSESTree.Expression;
 * }} Member
 */

const memberGroup = () => ({
	ctor: /** @type {Member | undefined} */(undefined),
	methods: /** @type {Array<Member>} */([]),
	properties: /** @type {Array<Member>} */([]),
});

const isProperty = (/** @type {Member} */member) => {
	return (
		member.type === AST_NODE_TYPES.PropertyDefinition
		&& member.value?.type !== AST_NODE_TYPES.ArrowFunctionExpression
	) || (
		member.type === AST_NODE_TYPES.MethodDefinition
		&& (member.kind === `get` || member.kind === `set`)
	);
};

const getName = (/** @type {Member} */member) =>
	member.key?.type === AST_NODE_TYPES.Literal
		? (member.key.value ?? member.key.raw).toString()
		: (member.key?.name ?? ``);


const getReportableName = (/** @type {Member} */member) => {
	let out = /** @type {Array<string>} */([]);

	if (member.type === AST_NODE_TYPES.StaticBlock) {
		out.push(`static constructor`);
	} else {
		if (member.static === true) {
			out.push(`static`);
		} else {
			out.push(`instance`);
		}

		if (member.kind === `get`) {
			out.push(`getter`);
		} else if (member.kind === `set`) {
			out.push(`setter`);
		} else if (member.type === AST_NODE_TYPES.PropertyDefinition) {
			out.push(`property`);
		} else {
			out.push(`method`);
		}

		out.push(`'${getName(member)}'`);
	}

	return out.join(` `);
};

const getSortableName = (/** @type {Member} */member) => {
	let name = getName(member);

	name = name.replace(/^[#_$]/, ``);
	name = name.toLowerCase();

	if (member.kind === `get`) {
		name += `__get`;
	} else if (member.kind === `set`) {
		name += `__set`;
	}

	return name;
};

export default ESLintUtils.RuleCreator.withoutDocs({
	defaultOptions: [],
	meta: {
		docs: {
			description: `TODO 1`,
		},
		messages: {
			[messageId]: `{{name}} should go after {{nameNext}}`,
		},
		schema: [],
		type: `suggestion`,
	},

	create(context) {
		function validateOrder(
			/** @type {Array<TSESTree.ClassElement | TSESTree.TypeElement>} */ nodes,
		) {
			const members = /** @type {Array<Member>} */(nodes);

			const ordered = {
				instance: memberGroup(),
				static: memberGroup(),
			};

			for (const member of /** @type {Array<Member>} */(members)) {
				if (member.type === AST_NODE_TYPES.StaticBlock) {
					ordered.static.ctor = member;
				} else if (member.static === true) {
					if (isProperty(member)) {
						ordered.static.properties.push(member);
					} else {
						ordered.static.methods.push(member);
					}
				} else {
					if (isProperty(member)) {
						ordered.instance.properties.push(member);
					} else if (member.kind === `constructor`) {
						ordered.instance.ctor = member;
					} else {
						ordered.instance.methods.push(member);
					}
				}
			}

			ordered.static.methods.sort(sortOn(getSortableName));
			ordered.static.properties.sort(sortOn(getSortableName));
			ordered.instance.methods.sort(sortOn(getSortableName));
			ordered.instance.properties.sort(sortOn(getSortableName));

			const membersByRank = ([
				ordered.static.properties,
				ordered.static.ctor,
				ordered.static.methods,
				ordered.instance.properties,
				ordered.instance.ctor,
				ordered.instance.methods,
			]).flat();

			const ranksByMember = /** @type {Map<Member, number>} */(new Map());
			membersByRank.forEach((member, index) => {
				if (member === undefined) {
					return;
				}

				ranksByMember.set(member, index);
			});

			members.forEach((member, index) => {
				const memberNext = members[index + 1];

				const rank = /** @type {number} */(ranksByMember.get(member));
				const rankNext = ranksByMember.get(memberNext);

				if (rankNext === undefined) {
					return;
				}

				if (rank > rankNext) {
					context.report({
						data: {
							name: getReportableName(member),
							nameNext: getReportableName(memberNext),
						},
						messageId,
						node: /** @type {TSESTree.Node} */(/** @type {unknown} */(member)),
					});
				}
			});
		}

		return {
			ClassDeclaration(node) {
				validateOrder(node.body.body);
			},

			ClassExpression(node) {
				validateOrder(node.body.body);
			},

			TSInterfaceDeclaration(node) {
				validateOrder(node.body.body);
			},

			TSTypeLiteral(node) {
				validateOrder(node.members);
			},
		};
	},
});
