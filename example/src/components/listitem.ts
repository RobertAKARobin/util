import { Component } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	@Component.attribute({ name: `data-value` }) value!: string;

	@Component.event()
	onDelete() {}

	template = () => /*html*/`
	<p>List item ID ${this.id}</p>

	${new Textbox().set({
		id: `${this.id}-text`,
		value: this.value,
	})}

	<button
		onclick="${this.bind(`onDelete`)}"
		type="button"
	>Remove</button>
	`;
}
