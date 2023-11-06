import { title } from '@robertakarobin/web';

import { resolve, routes } from './routes.ts';
import layout from './pages/_layout.ts';

// TODO1: Move to project build
export const resolveStatic = async(path: string) => {
	const contents = await resolve(path);
	if (!contents) {
		throw new Error(`Template not defined for path '${path}'`);
	}
	if (path === routes.bundled || path === routes.split) {
		return;
	}
	return layout(title.last, contents);
};
