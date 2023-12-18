import { Component } from '@robertakarobin/web/component.ts';

import type * as Type from '@src/types.d.ts';
import { ListItem } from './listitem.ts';

export class List extends Component<Type.List> {
	static {
		this.init();
	}

	template = () => `
<ol>
	${this.$.map(({ value }, index) => `
		<li>${ListItem.get(`${this.id}-${index}`).set(value)}</li>
	`).join(`\n`)}
</ol>
	`;
}
