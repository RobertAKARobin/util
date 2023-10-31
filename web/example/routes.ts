export { template as link } from '@robertakarobin/web/components/link.ts';
import type * as Type from '@robertakarobin/web/types.d.ts';

import { errorPage } from './pages/error.ts';
import { indexPage } from './pages/index.ts';

export const routes = {
	home: `/`,
} as const satisfies Type.Routes;

export const resolve: Type.Resolver = path => {
	switch (path) {
		case routes.home:
			return [`Home page`, indexPage()];
		default:
			return [`Error 404`, errorPage()];
	}
};
