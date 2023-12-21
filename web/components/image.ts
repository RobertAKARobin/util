import { Component } from '../component.ts';

export class Image extends Component(`img`) {
	static {
		this.init();
	}

	isHydrated = false;
}
