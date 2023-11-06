import type * as Type from '@robertakarobin/web/types.d.ts';
import { title } from '@robertakarobin/web';

import layout from './pages/_layout.ts';
import { resolve } from './routes.ts';

// TODO1: Move to project build
export default async(path: Type.RoutePath) => {
	const contents = await resolve(path);
	if (!contents) {
		throw new Error(`Template not defined for path '${path as string}'`);
	}
	return layout(title.last, contents);
};
