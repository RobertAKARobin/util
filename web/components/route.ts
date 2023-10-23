export const Route = (
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
