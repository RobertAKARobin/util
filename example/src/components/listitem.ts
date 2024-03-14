import { Component, html } from '@robertakarobin/util/components/component.ts';
import { type EntityId } from '@robertakarobin/util/emitter/entities.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	@Component.attribute({ name: `data-text` }) text!: string;

	constructor(id: EntityId) {
		super();
		if (this.id === ``) {
			this.id = `${id}` ?? Component.uid();
		}
	}

	@Component.event()
	onDelete() {}

	@Component.event()
	onInput(event: CustomEvent<string>) {
		return event.detail;
	}

	template = () => html`
	<p>List item ID ${this.id}</p>

	${new Textbox()
		.set({ value: this.text })
		.on(`onInput`, this, `onInput`)
	}

	<button
		${this.on(`click`, `onDelete`)}
		type="button"
	>Remove</button>
	`;
}
