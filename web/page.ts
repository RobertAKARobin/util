import { appContext } from './context.ts';
import { Component } from './component.ts';
export { html, css } from '@robertakarobin/jsutil/template.ts';

type PageType = {
	title: string;
};

export abstract class Page<
	State extends Record<string, unknown> = Record<string, unknown>,
> extends Component<PageType & State> {
	set(...[update, ...args]: Parameters<Component<{ title: string; } & State>[`set`]>) {
		if (`title` in update) {
			if (appContext === `browser`) {
				document.title = update.title!;
			}
		}
		return super.set(update, ...args);
	}
}
