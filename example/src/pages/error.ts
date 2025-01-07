import { Component, html, Page } from '@robertakarobin/util/util/components/component';

@Component.define()
export class ErrorPage extends Page {
	override template = () => super.template(html`
<h1>404 page :(</h1>
`);
}
