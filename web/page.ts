import { Emitter } from '@robertakarobin/emit';

import { Component } from './component.ts';

export abstract class Page extends Component { // TODO2: On all instance properties, support `(route) =>` so that if this page is used on multiple routes, reach route can have a different configuration.
	static readonly shouldFallback = new Emitter<boolean>();
	static readonly splitImportMetaUrl = new Emitter<string>();
	static title = new Emitter<string>();

	/** If `true`, this Page is compiled into a static `.html` file at the route(s) used for this Page.*/
	readonly doFallback: boolean = true;
	/** Set `splitImportMetaUrl = import.meta.url` to have this Page compiled into a .js template file, suitable for dynamic import, as opposed to bundling it along with all the other Pages.
	 *
	 * (I tried using a wrapper around the import path, but then neither ESBuild nor the IDE recognize the import.)
	*/
	abstract readonly splitImportMetaUrl?: string | null;
	abstract title: string;

	render(...args: Parameters<this[`template`]>) {
		Page.title.next(this.title);
		Page.shouldFallback.next(this.doFallback);
		Page.splitImportMetaUrl.next(this.splitImportMetaUrl!);
		return super.render(...args);
	}
}
