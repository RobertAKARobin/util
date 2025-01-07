import { baseUrl } from '@robertakarobin/util/util/web/context';
import { toAttributes } from '@robertakarobin/util/util/dom/attributes';

import { router } from '@src/app';

export function link(
	routeName: keyof typeof router.routes,
	content: string = ``,
	attributeOverrides: Record<string, string> = {},
) {
	const route = router.routes[routeName];
	const url = new URL(route, baseUrl);
	const isExternal = url.origin !== baseUrl.origin;
	const attributes = isExternal
		? {
			href: url,
			rel: `noreferrer`,
			target: `_blank`,
			...attributeOverrides,
		}
		: {
			href: route,
			...attributeOverrides,
		};
	return `<a ${toAttributes(attributes)}>${content}</a>`;
}
