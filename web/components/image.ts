import { Component, toAttributes } from '@robertakarobin/web/index.ts';

export const image = new Component(
	({ alt, src, ...rest }: {
		alt: string;
		src: string;
	}) => `
		<img
			alt="${alt}"
			src="${src}"
			${toAttributes(rest)}
			/>
	`
);
