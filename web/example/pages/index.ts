import { Component } from '@robertakarobin/web/component.ts';

export const indexPage = new Component(
	() => `
	<h1>Hello world!</h1>
	`,

	`
	h1 {
		color: red;
	}
	`,
);
