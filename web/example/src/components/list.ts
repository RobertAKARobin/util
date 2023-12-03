import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import type * as Type from '@src/types.d.ts';
import { ListItem } from './listitem.ts';

export class List extends Component<{ items: Type.List; }> {
	addAt = new Emitter<number>();
	move = new Emitter<{ id: string; increment: number; }>();
	remove = new Emitter<string>();
	value = new Emitter<{ id: string; value: string; }>();

	constructor(args: {
		id: string;
		items: Type.List;
	}) {
		super(args);
	}

	template = () => `
<ol>
	${this.last.items.map(({ id, value }, index) => `
		<li>${
			new ListItem({ id: `${this.id}-${id}`, value })
				// .on(`add`, (value, item) => item.closest(List).addAt.next(index))
				// .on(`move`, (increment, item) => item.closest(List).move.next({ id, increment }))
				// .on(`remove`, (value, item) => item.closest(List).remove.next(id))
				// .on(`value`, (value, item) => item.closest(List).value.next({ id, value }))
				.render()
		}</li>
	`).join(`\n`)}
</ol>
	`;
}
