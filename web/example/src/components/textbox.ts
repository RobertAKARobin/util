import { Component } from '@robertakarobin/web/index.ts';

import { types } from '../theme.ts';

export class Textbox extends Component<Textbox> {
	static style = `
input {
	${types.body}
}
	`;

	accept(input: {
		maxlength?: number;
		value?: string;
	}) {
		const state = {
			maxlength: input.maxlength ?? 10,
			value: input.value ?? ``,
		};
		this.attributes = state;
		return state;
	}

	handleInput(event: Event) {
		this.state.next({
			...this.state.last,
			value: (event.currentTarget as HTMLInputElement).value,
		});
		this.$el!.querySelector(`span`)!.innerHTML = this.remaining(); // TODO1: Better rerender
	}

	remaining() {
		return `
		${this.$.maxlength - this.$.value.length} / ${this.$.maxlength} Remaining
		`;
	}

	template = () => `
		<div>
			<input
				oninput=${this.bind(`handleInput`)}
				placeholder="Type here"
				type="text"
				${this.attrs()}
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}

export default Component.toFunction(Textbox);
