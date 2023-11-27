import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { Component } from './component.ts';

export abstract class Page extends Component {

	/**
	 * The current page of the application
	 */
	static current = new Emitter<Page>({
		cache: {
			limit: 0,
		},
	});

	$outlet: HTMLElement | undefined;
	title: string = ``;

	constructor(input: {
		title?: string;
	} = {}) {
		super();

		this.title = input.title ?? this.title;
	}

	rerender() {
		const $outlet = this.$outlet!;
		while ($outlet.firstChild) {
			$outlet.removeChild($outlet.lastChild!);
		}
		this.$outlet!.insertAdjacentHTML(`afterbegin`, this.template());
		return ``;
	}
}
