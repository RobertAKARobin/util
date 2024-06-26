import { test } from '../spec/index.ts';

import { type RouteMap, type RoutePathFunction, Router } from './router.ts';

const routes = {
	builder: (param: string) => `/foo/${param}`,
	dotHtml: `/foo/bar.html`,
	external: `https://robertakarobin.com`,
	home: `/`,
	internal: `/login`,
} as const satisfies RouteMap;
const router = new Router(routes);

const delim = Router.paramDelimeter;

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(Router.toUrl(new URL(`https://b.test`)).href) === `https://b.test/`);
	$.assert(x => x(Router.toUrl(new URL(`https://b.test/`)).href) === `https://b.test/`);
	$.assert(x => x(Router.toUrl(`https://b.test`)).href === `https://b.test/`);
	$.assert(x => x(Router.toUrl(`https://b.test/`)).href === `https://b.test/`);
	$.assert(x => x(Router.toUrl(`./`)).href ===  `https://a.test/`);
	$.assert(x => x(Router.toUrl(`./foo`)).href ===  `https://a.test/foo`);
	$.assert(x => x(Router.toUrl(`./foo/index.html`)).href ===  `https://a.test/foo/index.html`);
	$.assert(x => x(Router.toUrl(() => `/foo`)).href === `https://a.test/foo`);
	$.assert(x => x(Router.toUrl((p: string) => `/aaa/${p}`)).href === `https://a.test/aaa/${delim}`);
	$.assert(x => x(Router.toUrl((p: string) => `/aaa/${p}/bbb/${p}`)).href === `https://a.test/aaa/${delim}/bbb/${delim}`);

	$.assert(x => x(Router.isMatch(`/`, routes.home)));
	$.assert(x => x(Router.isMatch(routes.home, routes.home)));
	$.assert(x => x(Router.isMatch(`/foo/bar`, `/foo/bar`)));
	$.assert(x => x(Router.isMatch(`/foo/bar/`, `/foo/bar`)));
	$.assert(x => x(Router.isMatch(`/foo/bar`, `/foo/bar/`)));
	$.assert(x => x(Router.isMatch(`/foo/bar?foo=bar`, `/foo/bar/`)));
	$.assert(x => x(Router.isMatch(`/foo/bar`, `/foo/bar/?foo=bar`)));
	$.assert(x => x(Router.isMatch(`/foo/bar&foo=bar`, `/foo/bar/`)) === false);
	$.assert(x => x(Router.isMatch(`https://a.test`, `https://a.test`)));
	$.assert(x => x(Router.isMatch(`https://a.test/`, `https://a.test`)));
	$.assert(x => x(Router.isMatch(`https://a.test`, `https://a.test/`)));
	$.assert(x => x(Router.isMatch(`/foo/bar.html`, `foo/bar.html`)));

	$.assert(x => x(Router.isMatch(`/foo/bar.html/`, `/foo/bar.html`))); // TODO3: These really shouldn't match. But also should never occur
	$.assert(x => x(Router.isMatch(`/foo/bar.html`, `/foo/bar.html/`)));

	$.assert(x => x(Router.toLine(routes.builder)) === `https://a.test/foo/${delim}`);
	$.assert(x => x(Router.isMatch(`/foo/bar`, routes.builder)));
	$.assert(x => x(Router.isMatch(`/foo/bar/`, routes.builder)));
	$.assert(x => x(Router.match(`/foo/bar/`, routes.builder))?.join(`,`) === `bar`);
	$.assert(x => x(Router.match(`/foo/bar/baz`, routes.builder)) === null);
	$.assert(x => x(Router.isMatch(`/foo/`, routes.builder) === false));
	$.assert(x => x(Router.isMatch(`/foo/bar/baz`, routes.builder) === false));
	$.assert(x => x(Router.isMatch(`/foo/bar.html`, routes.builder) === false));

	let route: RoutePathFunction;

	$.log(() => route = ({ param }: { param: string; }) => `/foo/${param}/bar/${param}`);
	$.assert(x => x(Router.toLine(route)) === `https://a.test/foo/${delim}/bar/${delim}`);
	$.assert(x => x(Router.isMatch(`/foo/aaa/bar/bbb`, route)));
	$.assert(x => x(Router.match(`/foo/aaa/bar/bbb`, route))?.join(`,`) === `aaa,bbb`);
	$.assert(x => x(Router.match(`/foo/a a a/bar/bbb`, route))?.join(`,`) === `a a a,bbb`);

	$.log(() => route = ([ a, [b], [[c]] ]: Array<string>) => `/foo/${a}/bar/${b}/baz/${c}`);
	$.assert(x => x(Router.toLine(route)) === `https://a.test/foo/${delim}/bar/${delim}/baz/${delim}`);
	$.assert(x => x(Router.isMatch(`/foo/a/bar/b/baz/c`, route)));
	$.assert(x => x(Router.match(`/foo/a/bar/b/baz/c`, route))?.join(`,`) === `a,b,c`);

	$.log(() => route = ([{ param }]: Array<{ param: () => string; }>) => `/foo/${param()}`);
	$.assert(x => x(Router.toLine(route)) === `https://a.test/foo/${delim}`);

	$.assert(x => x(router.findRouteName(`/foo/bar`)) === `builder`);
	$.assert(x => x(router.match(`/foo/bar`))?.join(`,`) === `bar`);
	$.assert(x => x(router.match(`/foo`)) === null);
});
