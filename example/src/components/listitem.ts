import { ComponentFactory } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

export class ListItem extends ComponentFactory(`li`, {
	'data-value': {
		default: ``,
	},
}) {
	static {
		this.init();
	}

	events = {
		value: (value: string) => ({
			id: this.id,
			value,
		}),
	};

	onPlace() {
		const $textbox = this.find(Textbox);
		$textbox.on(`value`, event => {
			this.emit(`value`, event.detail);
			event.stopPropagation();
		});
	}

	template = () => `
	<p>List item ID ${this.id}</p>
	<button
		type="button"
	>↑</button>
	<button
		type="button"
	>↓</button>
	<button
		type="button"
	>Add before</button>
	${new Textbox({ id: `${this.id}-txt` }).set({
		'data-value': this.get(`data-value`),
	})}
	<button
		type="button"
	>Remove</button>
	`;
}
