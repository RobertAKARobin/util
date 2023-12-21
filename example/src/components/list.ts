import { Component } from '@robertakarobin/web/component.ts';

export class List extends Component(`ol`) {
	static {
		this.init();
	}

	template = () => `
<ol>

</ol>
	`;
}

// ${this.$.map(({ value }, index) => `
// <li>${ListItem.get(`${this.id}-${index}`).set(value)}</li>
// `).join(`\n`)}
