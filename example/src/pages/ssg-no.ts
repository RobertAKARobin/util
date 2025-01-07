import { Component, html, Page } from '@robertakarobin/util/util/components/component';

@Component.define()
export class NoSSGPage extends Page {
	override template = () => html`
<h1>SSG no</h1>
`;
}
