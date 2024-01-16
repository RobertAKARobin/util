import { Component, Page } from '@robertakarobin/web/component.ts';

@Component.define()
export class NoSSGPage extends Page {
	isSSG = false;
	template = () => /*html*/`
<h1>SSG no</h1>
`;
}
