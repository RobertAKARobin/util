import { modalContainer } from '@robertakarobin/web/components/modal-container.ts';
import { Page } from '@robertakarobin/web/component.ts';

import { nav } from '@src/components/nav.ts';

export class Layout extends Page.custom(`main`) {
	constructor(
		pageTitle: Page[`pageTitle`]
	) {
		super();
		this.pageTitle = pageTitle ?? this.pageTitle;
	}

	template(contents: string) {
		return `
${nav()}
${contents}
${modalContainer()}
		`;
	}
}
