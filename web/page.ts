import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { Component } from './component.ts';

export abstract class Page extends Component {
	static readonly title = new Emitter<string>();

	get ctor() {
		return this.constructor as typeof Page;
	}
	/**
	 * If `true`, this Page is compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
	 * Not a static variable because if a Page is used for multiple routes, the different routes may/may not want to be SSG
	*/
	readonly isSSG: boolean = true;
	abstract title: string;
}
