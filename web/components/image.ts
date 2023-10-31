import { toAttributes } from './toAttributes.ts';

export const template = ({ alt, src, ...rest }: {
	alt: string;
	src: string;
}) => `
<img
	alt="${alt}"
	src="${src}"
	${toAttributes(rest)}
	/>
`;
