import { Component, html } from '../component.ts';

export type ImageType = {
	alt: string;
	src: string;
};

export class Image extends Component(`img`) {
	static {
		this.init();
	}

	isHydrated = false;

	template = () => html`
<img />
`;
}
