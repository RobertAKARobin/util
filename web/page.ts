import { appContext } from '@robertakarobin/jsutil/context.ts';

import { Component } from './component.ts';

export abstract class Page extends Component {

	title: string = ``;

	constructor(input: {
		id?: string;
		title?: string;
	} = {}) {
		super(input);
		if (appContext === `browser`) {
			document.title = this.title;
		}
	}
}
