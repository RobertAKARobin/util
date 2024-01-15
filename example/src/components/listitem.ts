import { Component } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	@Component.attribute({ name: `data-text` }) text!: string;

	constructor(id: string) {
		super(id);
	}

	@Component.event()
	onDelete() {}

	template = () => /*html*/`
	<p>List item ID ${this.id}</p>

	${new Textbox(`${this.id}-text`).set({
		value: this.text,
	})}

	<button
		onclick="${this.bind(`onDelete`)}"
		type="button"
	>Remove</button>
	`;
}
