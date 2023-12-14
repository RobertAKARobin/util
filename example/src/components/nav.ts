import { Component } from '@robertakarobin/web/component.ts';

import { modalContainer } from '@src/state.ts';
import { paths } from '@src/router.ts';
import { ProgressModal } from '@src/modals/progress.ts';

export class Nav extends Component {
	static {
		this.init();
	}

	openModal() {
		modalContainer.place(new ProgressModal());
	}

	template = () => `
	<nav>
		<ul>
			${Object.entries(paths).map(([routeName, route]) => `
				<li>
					<a href="${route}">Go ${routeName}</a>
				</li>
			`).join(``)}
			<li>
				<button
					onclick=${this.bind(`openModal`)}
					type="button"
				>Modal</button>
			</li>
		</ul>
	</nav>
	`;
}
