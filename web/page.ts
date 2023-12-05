import { appContext } from '@robertakarobin/jsutil/context.ts';

import { Component } from './component.ts';

export abstract class Page<
	State extends Record<string, unknown> = Record<string, unknown>,
> extends Component<{ title: string; } & State> {
	set(...[update, ...args]: Parameters<Component<{ title: string; } & State>[`set`]>) {
		if (`title` in update) {
			if (appContext === `browser`) {
				document.title = update.title!;
			}
		}
		return super.set(update, ...args);
	}
}
