import { router, routerContext } from '../index.ts';
import { bind } from '../plugins/bind.ts';

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

export const link = ({ href, content, ...rest }: {
	content: string;
	href: string;
}) => {
	const isAbsolute = absoluteUrl.test(href);
	return `
		<a
			href="${href}"
			${isAbsolute || routerContext === `browser` ? `onclick=${bind(routeTo, href)}` : ``}
			target="${isAbsolute ? `_blank` : `_self`}"
			${toAttributes(rest)}
			>
			${content || ``}
		</a>
	`;
};
