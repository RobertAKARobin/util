import { Component } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	@Component.attribute({
		name: `data-value`,
	}) value = ``;

	$onPlace() {
		const $textbox = this.findDown(Textbox);
		$textbox.on(`emitValue`, event => {
			this.emitValue(event.detail);
			event.stopPropagation();
		});
	}

	@Component.event()
	emitDelete() {}

	@Component.event()
	emitValue(value: string) {
		return value;
	}

	template = () => `
	<p>List item ID ${this.id}</p>
	${Textbox.get(`${this.id}-txt`).set({ valueOverride: this.value })}
	<button
		onclick="${this.bind(`emitDelete`)}"
		type="button"
	>Remove</button>
	`;
}
