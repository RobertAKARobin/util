import { Component } from '@robertakarobin/web/component.ts';
import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';

import { Link, routeNames } from '@src/router.ts';
import { ProgressModal } from '@src/modals/progress.ts';

export class Nav extends Component(`nav`) {
	static {
		this.init();
	}

	openModal() {
		ModalContainer.get().place(new ProgressModal());
	}

	template = () => `
<ul>
	${routeNames.map(routeName => `
		<li>${Link.to(routeName, `Go ${routeName}`)}</li>
	`).join(``)}

	<li>
		<button
			onclick="this.closest(Nav).openModal()"
			type="button"
		>Modal</button>
	</li>
</ul>
	`;
}
