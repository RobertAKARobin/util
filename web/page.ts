import { appContext } from '@robertakarobin/jsutil/context.ts';

import { Component } from './component.ts';

export abstract class Page<State = object>
	extends Component<{ title: string; } & State> {
	constructor(input: { title?: string; } & State) {
		super({
			...input,
			title: input.title ?? ``,
		});
		if (appContext === `browser`) {
			document.title = this.last.title!;
		}
	}
}
