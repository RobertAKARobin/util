import { Component } from '@robertakarobin/web/index.ts';

import type * as Type from '@src/types.d.ts';
import { ListItem } from './listitem.ts';

ListItem.init();

export class List extends Component<Type.List> {
	isReplace = true;

	template = () => `
<ol>
	${this.$.map(({ value }, index) => `
		<li>${
			new ListItem(`${this.id}-${index}`)
				.set(value)
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
