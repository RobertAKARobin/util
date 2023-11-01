import { toAttributes } from './toAttributes.ts';

export const image = ({ alt, src, ...rest }: {
	alt: string;
	src: string;
}) => `
<img
	alt="${alt}"
	src="${src}"
	${toAttributes(rest)}
	/>
`;
