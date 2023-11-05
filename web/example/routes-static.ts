import type * as Type from '@robertakarobin/web/types.d.ts';
import { title } from '@robertakarobin/web';

import layout from './pages/_layout.ts';
import { resolve } from './routes.ts';

export default async(path: Type.RoutePath) => {
	const contents = await resolve(path);
	return layout(title.last, contents);
};
