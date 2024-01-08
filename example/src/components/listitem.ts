import { Component, html } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	onDelete = this.event(`onDelete`);
	@Component.attribute({ name: `data-value` }) value!: string;

	template = () => html`
	<p>List item ID ${this.id}</p>

	${Textbox.el({
		id: `${this.id}-text`,
		value: this.value,
	})}

	<button
		onclick="${this.bind(`onDelete`)}"
		type="button"
	>Remove</button>
	`;
}
