import { baseUrl } from '@robertakarobin/util/context.ts';
import { toAttributes } from '@robertakarobin/util/dom/attributes.ts';

import { router } from '@src/app.ts';

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
			rel: `noopener`,
			target: `_blank`,
			...attributeOverrides,
		}
		: {
			href: route,
			...attributeOverrides,
		};
	return `<a ${toAttributes(attributes)}>${content}</a>`;
}
