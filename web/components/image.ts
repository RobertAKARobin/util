import { ComponentFactory } from '../component.ts';

export class Image extends ComponentFactory(`img`, {
	alt: undefined as unknown as string,
	src: undefined as unknown as string,
}) {
	static {
		this.init();
	}

	isHydrated = false;
}
