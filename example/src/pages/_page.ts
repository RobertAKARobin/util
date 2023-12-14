import { Page } from '@robertakarobin/web/component.ts';

import { Nav } from '@src/components/nav.ts';

export class BasePage<
	State extends Record<string, unknown> = Record<string, unknown>,
> extends Page<State> {

	template(body: string) { // Not using fat arrow becaue this gets superclassed
		return `
			<body>
				${new Nav(`nav`).render()}
				${body}
			</body>
		`;
	};
}
