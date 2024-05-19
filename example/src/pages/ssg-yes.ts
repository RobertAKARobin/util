import { Component, html, Page } from '@robertakarobin/util/components/component.ts';

const style = /*css*/`
h1 {
	color: purple;
}
`;

@Component.define({ style })
export class YesSSGPage extends Page {
	template = () => html`
<h1>SSG yes</h1>

<div id="jump1">Jump 1</div>
<div id="jump2">Jump 2</div>
`;
}
