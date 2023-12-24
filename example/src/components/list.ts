import { Component } from '@robertakarobin/web/component.ts';
import { Emitter } from '@robertakarobin/util/emitter.ts';

import type * as Type from '@src/types.js';
import { ListItem } from './listitem.ts';

export class List extends Component(`ol`) {
	static {
		this.init();
	}

	listItems = new Emitter<Array<Type.ListItem>>();

	template = () => `
<ol>
	${this.listItems.value.map(({ value }, index) => `
		<li>${
			ListItem.get(`${this.id}-${index}`).setAttributes({ 'data-value': value })}
		</li>
	`).join(`\n`)}
</ol>
	`;
}
