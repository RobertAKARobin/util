import { Component, Page } from '@robertakarobin/util/component.ts';

@Component.define()
export class ErrorPage extends Page {
	template = () => super.template(/*html*/`
<h1>404 page :(</h1>
`);
}
