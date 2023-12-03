import { Component } from '@robertakarobin/web/index.ts';

import { types } from '@src/theme.ts';

export class Textbox extends Component<{
	maxlength: number;
	value: string;
}> {

	static style = `
input {
	${types.body}
}
	`;

	constructor(args: {
		id?: string;
		maxlength?: number;
		value?: string;
	}) {
		super({
			...args,
			maxlength: args.maxlength ?? 10,
			value: args.value ?? ``,
		});
	}

	handleInput(event: Event) {
		this.next({
			...this.last,
			value: (event.currentTarget as HTMLInputElement).value,
		});
		this.find(`span`).innerHTML = this.remaining(); // TODO1: Better rerender
	}

	remaining() {
		return `${this.last.maxlength - this.last.value.length} / ${this.last.maxlength} Remaining`;
	}

	template = () => `
		<div>
			<input
				maxlength="${this.last.maxlength}"
				oninput=${this.bind(`handleInput`)}
				placeholder="Type here"
				type="text"
				value="${this.last.value}"
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}
