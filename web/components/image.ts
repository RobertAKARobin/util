export const image = (input: {
	alt: string;
	src: string;
}) => `
	<img
		alt="${input.alt}"
		src="${input.src}"
		/>
`;
