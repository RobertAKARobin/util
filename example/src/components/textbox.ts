import { Component } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

@Component.define()
export class Textbox extends Component.custom(`div`) {
	static style = `
input {
	${types.body}
}
	`;

	@Component.attribute({
		name: `data-max`,
	}) maxLength = 10;
	@Component.attribute({
		name: `data-value`,
	}) valueOverride = ``;

	@Component.event()
	emitValue(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		this.setRemaining();
		return value;
	}

	onPlace() {
		this.setRemaining();
	}

	setRemaining() {
		const $input = this.findDown(`input`);
		const value = $input.value;
		this.querySelector(`span`)!.innerHTML = `${this.maxLength - value.length} / ${this.maxLength} Remaining`;
	}

	template = () => `
<input
	maxlength="${this.maxLength}"
	oninput="${this.bind(`emitValue`)}"
	placeholder="Type here"
	type="text"
	value="${this.valueOverride}"
>

<span></span>

<p>textbox ID ${this.id}</p>
		`;
}
