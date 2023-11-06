import type * as Type from '@robertakarobin/web/types.d.ts';
import { link } from '@robertakarobin/web';

export { link }; // So we can import link along with routes, since they're usually used together

export const routes = {
	bundled: `/bundled`,
	bundledFallback: `/bundled-fallback`,
	error404: `/404.html`,
	home: `/`,
	split: `/split`,
	splitFallback: `/split-fallback`,
} as const satisfies Type.Routes;

export const resolve = async(path: Type.RoutePath) => {
	switch (path) {
		case routes.bundled:
			return (await import(`./pages/bundled.ts`)).default();
		case routes.bundledFallback:
			return (await import(`./pages/bundled-fallback.ts`)).default();
		case routes.error404:
			return (await import(`./pages/error.ts`)).default();
		case routes.home:
			return (await import(`./pages/index.ts`)).default();
		case routes.split:
			return (await import(`./pages/split.ts`)).default();
		case routes.splitFallback:
			return (await import(`./pages/split-fallback.ts`)).default();
	}
};
