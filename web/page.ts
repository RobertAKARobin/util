import { Emitter } from '@robertakarobin/emit';

import { Component } from './component.ts';

export abstract class Page extends Component {
	static importMetaUrl = new Emitter<string>();
	static title = new Emitter<string>();

	/** By default, ESBuild bundles all code into one file, including dynamic imports. If this parameter is specified, and this page is loaded by dynamic import, ESBuild will "split" the page's code from the rest of the bundle into a file named `{pathName}.html.js` and update the dynamic import to point to that file. */
	readonly importMetaUrl?: string;
	abstract title: string;

	render(...args: Parameters<this[`template`]>) {
		Page.title.next(this.title);
		Page.importMetaUrl.next(this.importMetaUrl!);
		return super.render(...args);
	}
}
