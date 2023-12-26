import { ComponentFactory } from '../component.ts';

export class Image extends ComponentFactory(`img`, {
	alt: {
		default: undefined as unknown as string,
	},
	src: {
		default: undefined as unknown as string,
	},
}) {
	static {
		this.init();
	}
}
