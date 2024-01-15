import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';
import { Page } from '@robertakarobin/web/component.ts';

import { Nav } from '@src/components/nav.ts';

export const modalContainer = ModalContainer.find() ?? new ModalContainer();

export class Layout extends Page {
	template(contents: string) {
		return `
${Nav()}
${contents}
${modalContainer}
		`;
	}
}
