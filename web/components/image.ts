import { toAttributes } from '@robertakarobin/web/index.ts';

export const image = ({
	alt,
	src,
	...rest
}: {
	alt: string;
	src: string;
}) => `
	<img
		alt="${alt}"
		src="${src}"
		${toAttributes(rest)}
		/>
`;
