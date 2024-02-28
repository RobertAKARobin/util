import { Component, html, Page } from '@robertakarobin/util/components/component.ts';

@Component.define()
export class NoSSGPage extends Page {
	template = () => html`
<h1>SSG no</h1>
`;
}
