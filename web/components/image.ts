import { component } from '../index.ts';

const template = (input: {
	alt: string;
	src: string;
}) => `
	<img
		alt="${input.alt}"
		src="${input.src}"
		/>
`;

export const image = component({ template });
