import { Component, html } from '../component.ts';

export type ImageType = {
	alt: string;
	src: string;
};

export class Image extends Component<ImageType> {
	static {
		this.init();
	}

	isHydrated = false;

	template = () => html`
<img
	alt="${this.$.alt}"
	src="${this.$.src}"
	/>
`;
}
