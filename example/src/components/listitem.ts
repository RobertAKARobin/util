import { Component } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

export class ListItem extends Component(`div`) {
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
</div>
	`;
}


// ${Textbox.get().patch({ value: this.value })}
