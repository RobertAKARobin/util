import { Component } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

Textbox.init();

export class ListItem extends Component<string> {
	static {
		this.init();
	}

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
		.patch({ value: this.value })
		// .on(`value`, console.log)
		.render()}
</div>
	`;
}
