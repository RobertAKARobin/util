/* eslint-disable @stylistic/quote-props */
import { test } from './spec/index.ts';

import { Router } from './router.ts';

const baseUrl = `https://b.b`;
const routeMap = {
	home: `/`,
	login: `/login`,
	profile: `https://robertakarobin.com`,
	terms: `/legal/terms.html`,
};
const router = new Router(routeMap, { baseUrl });

export const spec = test(`Router`, $ => {
	$.assert(x => x(router.paths.home) === `/`);
	$.assert(x => x(router.link(`home`)) === `<a href="/"></a>`);

	$.assert(x => x(router.paths.login) === x(routeMap.login + `/`));
	$.assert(x => x(router.urls.login.toString()) === x(baseUrl + routeMap.login + `/`));
	$.assert(x => x(router.link(`login`, `Login`)) === `<a href="/login/">Login</a>`);
	$.assert(x => x(router.link(`login`, `Login`, { class: `foo` })) === `<a href="/login/" class="foo">Login</a>`);

	$.assert(x => x(router.paths.terms) === routeMap.terms);

	$.assert(x => x(router.urls.profile.toString() === x(routeMap.profile + `/`)));
	$.assert(x => x(router.link(`profile`, `Profile`)) === `<a href="https://robertakarobin.com/" rel="noopener" target="_blank">Profile</a>`);

	$.assert(x => x(router.findRouteName(`https://b.b/login`)) === `login`);
	$.assert(x => x(router.findRouteName(`https://b.b/login/`)) === `login`);
});
