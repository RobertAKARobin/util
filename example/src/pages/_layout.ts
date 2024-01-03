import { Page } from '@robertakarobin/web/component.ts';

import { modalContainer } from '@src/modals/_container.ts';
import { Nav } from '@src/components/nav.ts';

export class Layout extends Page {
	template(contents: string) {
		return `
${new Nav()}
${contents}
${modalContainer}
		`;
	}
}
