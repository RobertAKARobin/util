import { Emitter } from '@robertakarobin/emit';

import { Component } from './component.ts';

export abstract class Page extends Component { // TODO2: On all instance properties, support `(route) =>` so that if this page is used on multiple routes, reach route can have a different configuration.
	static readonly importMetaUrl = new Emitter<string>();
	static readonly shouldFallback = new Emitter<boolean>();
	static readonly shouldSplit = new Emitter<boolean>();
	static title = new Emitter<string>();

	/** If `true`, this Page is compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.*/
	readonly doFallback: boolean = true;
	/** If `true`, this Page is compiled into a static `.html.js` file at the route(s) used for this Page, which will caued the Page to be dynamically imported instead of bundled. */
	readonly doSplit: boolean = true;
	/** Set `importMetaUrl = import.meta.url`. This is required for the build process. (I tried using a wrapper around the import path, but then neither ESBuild nor the IDE recognize the import.) */
	abstract readonly importMetaUrl: string;
	abstract title: string;

	render(...args: Parameters<this[`template`]>) {
		Page.title.next(this.title);
		Page.importMetaUrl.next(this.importMetaUrl);
		Page.shouldFallback.next(this.doFallback);
		Page.shouldSplit.next(this.doSplit);
		return super.render(...args);
	}
}
