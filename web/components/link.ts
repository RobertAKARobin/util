import { bind, router } from '../index.ts';

import { toAttributes } from './toAttributes.ts';

const routeTo = (event: MouseEvent, path: string) => {
	if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
		return;
	}

	event.preventDefault();
	window.history.pushState({}, ``, path);
	router.next(path);
};

const absoluteUrl = /^\w+\:\/\//;

// I thought about making `link` accept just the route's name, but that starts getting complicated if the route is a function with parameters
export const link = ({ href, content, ...rest }: {
	content: string;
	href: string;
}) => {
	const isAbsolute = absoluteUrl.test(href);
	return `
		<a
			href="${href}"
			onclick=${bind(routeTo, href)}
			target="${isAbsolute ? `_blank` : `_self`}"
			${toAttributes(rest)}
			>
			${content || ``}
		</a>
	`;
};
