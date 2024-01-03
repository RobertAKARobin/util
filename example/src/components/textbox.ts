import { Component } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

@Component.define()
export class Textbox extends Component {
	static style = `
input {
	${types.body}
}
	`;

	@Component.attribute() maxLength = 10;
	@Component.attribute() valueOverride = ``;

	onPlace() {
		this.setRemaining();
	}

	@Component.event()
	onValue(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		this.setRemaining();
		return value;
	}

	setRemaining() {
		const $input = this.findDown(`input`);
		const value = $input.value;
		this.querySelector(`span`)!.innerHTML = `${this.maxLength - value.length} / ${this.maxLength} Remaining`;
	}

	template = () => `
<input
	maxlength="${this.maxLength}"
	oninput="${this.bind(`onValue`)}"
	placeholder="Type here"
	type="text"
	value="${this.valueOverride}"
>

<span></span>

<p>textbox ID ${this.id}</p>
		`;
}
