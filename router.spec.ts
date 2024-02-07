import { test } from './spec/index.ts';

import { type RouteMap, type RoutePathFunction, Router } from './router.ts';

const routes = {
	builder: (param: string) => `/foo/${param}`,
	dotHtml: `/foo/bar.html`,
	external: `https://robertakarobin.com`,
	home: `/`,
	internal: `/login`,
} as const satisfies RouteMap;
const router = new Router(routes);

export const spec = test(`Router`, $ => {
	$.assert(x => x(Router.toUrl(new URL(`https://b.test`)).href) === `https://b.test/`);
	$.assert(x => x(Router.toUrl(new URL(`https://b.test/`)).href) === `https://b.test/`);
	$.assert(x => x(Router.toUrl(`https://b.test`)).href === `https://b.test/`);
	$.assert(x => x(Router.toUrl(`https://b.test/`)).href === `https://b.test/`);
	$.assert(x => x(Router.toUrl(`./`)).href ===  `https://a.test/`);
	$.assert(x => x(Router.toUrl(`./foo`)).href ===  `https://a.test/foo`);
	$.assert(x => x(Router.toUrl(`./foo/index.html`)).href ===  `https://a.test/foo/index.html`);
	$.assert(x => x(Router.toUrl(() => `/foo`)).href === `https://a.test/foo`);
	$.assert(x => x(Router.toUrl((p: string) => `/aaa/${p}`)).href === `https://a.test/aaa/[%]`);
	$.assert(x => x(Router.toUrl((p: string) => `/aaa/${p}/bbb/${p}`)).href === `https://a.test/aaa/[%]/bbb/[%]`);

	$.assert(x => x(Router.isMatch(`/`, routes.home)));
	$.assert(x => x(Router.isMatch(routes.home, routes.home)));
	$.assert(x => x(Router.isMatch(`/foo/bar`, `/foo/bar`)));
	$.assert(x => x(Router.isMatch(`/foo/bar/`, `/foo/bar`)));
	$.assert(x => x(Router.isMatch(`/foo/bar`, `/foo/bar/`)));
	$.assert(x => x(Router.isMatch(`/foo/bar?foo=bar`, `/foo/bar/`)));
	$.assert(x => x(Router.isMatch(`/foo/bar`, `/foo/bar/?foo=bar`)));
	$.assert(x => x(!Router.isMatch(`/foo/bar&foo=bar`, `/foo/bar/`)));
	$.assert(x => x(Router.isMatch(`https://a.test`, `https://a.test`)));
	$.assert(x => x(Router.isMatch(`https://a.test/`, `https://a.test`)));
	$.assert(x => x(Router.isMatch(`https://a.test`, `https://a.test/`)));
	$.assert(x => x(Router.isMatch(`/foo/bar.html`, `foo/bar.html`)));

	$.assert(x => x(Router.isMatch(`/foo/bar.html/`, `/foo/bar.html`))); // TODO2: These really shouldn't match. But also should never occur
	$.assert(x => x(Router.isMatch(`/foo/bar.html`, `/foo/bar.html/`)));

	$.assert(x => x(Router.toPath(routes.builder)) === `https://a.test/foo/[%]`);
	$.assert(x => x(Router.isMatch(`/foo/bar`, routes.builder)));
	$.assert(x => x(Router.isMatch(`/foo/bar/`, routes.builder)));
	$.assert(x => x(Router.match(`/foo/bar/`, routes.builder))?.join(`,`) === `bar`);
	$.assert(x => x(Router.match(`/foo/bar/baz`, routes.builder)) === null);
	$.assert(x => x(!Router.isMatch(`/foo/`, routes.builder)));
	$.assert(x => x(!Router.isMatch(`/foo/bar/baz`, routes.builder)));
	$.assert(x => x(!Router.isMatch(`/foo/bar.html`, routes.builder)));

	let route: RoutePathFunction;

	$.log(() => route = ({ param }: { param: string; }) => `/foo/${param}/bar/${param}`);
	$.assert(x => x(Router.toPath(route)) === `https://a.test/foo/[%]/bar/[%]`);
	$.assert(x => x(Router.isMatch(`/foo/aaa/bar/bbb`, route)));
	$.assert(x => x(Router.match(`/foo/aaa/bar/bbb`, route))?.join(`,`) === `aaa,bbb`);

	$.log(() => route = ([ a, [b], [[c]] ]: Array<string>) => `/foo/${a}/bar/${b}/baz/${c}`);
	$.assert(x => x(Router.toPath(route)) === `https://a.test/foo/[%]/bar/[%]/baz/[%]`);
	$.assert(x => x(Router.isMatch(`/foo/a/bar/b/baz/c`, route)));
	$.assert(x => x(Router.match(`/foo/a/bar/b/baz/c`, route))?.join(`,`) === `a,b,c`);

	$.log(() => route = ([{ param }]: Array<{ param: () => string; }>) => `/foo/${param()}`);
	$.assert(x => x(Router.toPath(route)) === `https://a.test/foo/[%]`);

	$.assert(x => x(router.findRouteName(`/foo/bar`)) === `builder`);
	$.assert(x => x(router.match(`/foo/bar`))?.join(`,`) === `bar`);
	$.assert(x => x(router.match(`/foo`)) === null);
});
