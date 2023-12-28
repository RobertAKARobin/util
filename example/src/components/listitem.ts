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
		remove: () => ({ id: this.id }),
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

	onRemove() {
		this.emit(`remove`);
	}

	template = () => `
	<p>List item ID ${this.id}</p>
	${new Textbox({ id: `${this.id}-txt` }).set({
		'data-value': this.get(`data-value`),
	})}
	<button
		onclick="${this.bind(`onRemove`)}"
		type="button"
	>Remove</button>
	`;
}
