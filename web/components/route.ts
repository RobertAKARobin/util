import { component } from '../index.ts';

const template = (
	options: {
		to: string;
	},
	content: string
) => `
	<a
		href="${options.to}"
		onclick=""
		>
		${content}
	</a>
`;

export const route = component({ template });
