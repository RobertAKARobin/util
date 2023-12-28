import { ComponentFactory } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

export class Textbox extends ComponentFactory(`div`, {
	'data-maxlength': {
		default: 10,
		fromString: parseInt,
	},
	'data-value': {
		default: ``,
		fromString: (input: string) => input ?? ``,
	},
}) {

	static style = `
input {
	${types.body}
}
	`;

	static {
		this.init();
	}

	events = {
		value: (value: string) => value, // Not calling this `input` because that's a standard HTML event which also gets picked up by ListItem
	};

	handleInput(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		this.emit(`value`, value);
		this.setRemaining();
	}

	onPlace() {
		this.setRemaining();
	}

	setRemaining() {
		const $input = this.find(`input`);
		const value = ($input as HTMLInputElement).value;
		const maxLength = this.get(`data-maxlength`);
		this.querySelector(`span`)!.innerHTML = `${maxLength - value.length} / ${maxLength} Remaining`;
	}

	template = () => `
<input
	maxlength="${this.get(`data-maxlength`)}"
	oninput="${this.bind(`handleInput`)}"
	placeholder="Type here"
	type="text"
	value="${this.get(`data-value`)}"
>

<span></span>

<p>textbox ID ${this.id}</p>
		`;
}
