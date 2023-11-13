import { type App, Page, type RouteMap } from './index.ts';

export const setupForBrowser = <
	Routes extends RouteMap
>(app: App<Routes>, $root: HTMLElement = document.body) => {
	Page.title.subscribe(title => document.title = title);

	app.path.subscribe(async path => {
		$root.innerHTML = await app.resolve(path);
	});

	window.onpopstate = () => {
		const newPath = window.location.pathname;
		if (newPath !== app.path.last) {
			app.path.next(newPath as Routes[keyof Routes]);
		}
	};
};
