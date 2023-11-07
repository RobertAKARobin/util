import { Emitter } from '@robertakarobin/emit';

import { Component } from './component.ts';

export abstract class Page extends Component {
	static templatePath = new Emitter<string>();
	static title = new Emitter<string>();

	readonly importMetaUrl?: string;
	abstract title: string;

	render(...args: Parameters<this[`template`]>) {
		Page.title.next(this.title);
		Page.templatePath.next(this.importMetaUrl!);
		return super.render(...args);
	}
}
