export const Image = (input: {
	alt: string;
	src: string;
}) => `
	<img
		alt="${input.alt}"
		src="${input.src}"
		/>
`;
