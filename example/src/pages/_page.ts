import { Page } from '@robertakarobin/web/component.ts';

import { Nav } from '@src/components/nav.ts';

export class BasePage<
	State extends Record<string, unknown> = Record<string, unknown>,
> extends Page<State> {

	template(main: string) { // Not using fat arrow becaue this gets superclassed
		return `
			<div>
				${Nav.put(`nav`)}
				${main}
			</div>
		`;
	};
}
