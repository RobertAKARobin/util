import { Component, html } from '@robertakarobin/util/components/component.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	@Component.attribute({ name: `data-text` }) text!: string;

	@Component.event()
	onDelete() {}

	@Component.event()
	onInput(event: CustomEvent<string>) {
		return event.detail;
	}

	template = () => html`
	<p>List item ID ${this.id}</p>

	${Textbox.id(`${this.id}-text`)
		.set({ value: this.text })
		.on(`onInput`, this, `onInput`)
	}

	<button
		${this.on(`click`, `onDelete`)}
		type="button"
	>Remove</button>
	`;
}
