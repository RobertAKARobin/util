import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { Component } from './component.ts';

export abstract class Page extends Component {

	static current = new Emitter<Page>({
		cache: {
			limit: 0,
		},
	});

	/**
	 * If `true`, this Page is compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
	 * Not a static variable because if a Page is used for multiple routes, the different routes may/may not want to be SSG
	*/
	readonly isSSG: boolean = true;
	title: string = ``;

	constructor(input: {
		title?: string;
	} = {}) {
		super();

		this.title = input.title ?? this.title;
	}
}
