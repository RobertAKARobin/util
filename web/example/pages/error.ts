import { Component } from '@robertakarobin/web/index.ts';

import { link, routes } from '../routes.ts';

export const errorPage = new Component(
	() => `
	<h1>404 page :(</h1>

	<p>${link.render({ content: `Go home`, href: routes.home })}</p>
	`
);
