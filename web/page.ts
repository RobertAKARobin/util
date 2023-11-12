import { Emitter } from '@robertakarobin/emit';

import { Component } from './component.ts';

export abstract class Page extends Component { // TODO2: On all instance properties, support `(route) =>` so that if this page is used on multiple routes, reach route can have a different configuration.
	static readonly importMetaUrl = new Emitter<string>();
	static readonly isSSG = new Emitter<boolean>();
	static title = new Emitter<string>();

	/** Set `importMetaUrl = import.meta.url`. This is required for the build process. (I tried using a wrapper around the import path, but then neither ESBuild nor the IDE recognize the import.) */
	abstract readonly importMetaUrl: string;
	/** If `true`, this Page is compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.*/
	readonly isSSG: boolean = true;
	abstract title: string;

	render(...args: Parameters<this[`template`]>) {
		Page.title.next(this.title);
		Page.importMetaUrl.next(this.importMetaUrl);
		Page.isSSG.next(this.isSSG);
		return super.render(...args);
	}
}
