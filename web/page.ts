import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { Component } from './component.ts';

export abstract class Page extends Component {

	/**
	 * The current page of the application
	 */
	static current = new Emitter<Page>({
		limit: 0,
	});

	title: string = ``;

	constructor(input: {
		title?: string;
	} = {}) {
		super();

		this.title = input.title ?? this.title;
	}
}
