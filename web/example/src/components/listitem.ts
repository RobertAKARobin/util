import { Component } from '@robertakarobin/web/index.ts';

import type * as Type from '@src/types.d.ts';
import { Textbox } from '@src/components/textbox.ts';

Textbox.init();

export class ListItem extends Component<Type.ListItem> {
	template = () => `
<div>
	${this.id}
	<button
		type="button"
	>↑</button>
	<button
		type="button"
	>↓</button>
	<button
		type="button"
	>Add before</button>
	<button
		type="button"
	>Remove</button>
	${new Textbox()
		.set({ value: this.value.value })
		.on(`value`, console.log)
		.render()}
</div>
	`;
}
