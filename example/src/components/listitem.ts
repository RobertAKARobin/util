import { Component } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	@Component.attribute({
		name: `data-value`,
	}) value = ``;

	onPlace() {
		const $textbox = this.findDown(Textbox);
		$textbox.on(`onValue`, event => {
			this.onValue(event.detail);
			event.stopPropagation();
		});
	}

	@Component.event()
	onRemove() {
		return { id: this.id };
	}

	@Component.event()
	onValue(value: string) {
		return value;
	}

	template = () => `
	<p>List item ID ${this.id}</p>
	${new Textbox(`${this.id}-txt`).set({ valueOverride: this.value })}
	<button
		onclick="${this.bind(`onRemove`)}"
		type="button"
	>Remove</button>
	`;
}
