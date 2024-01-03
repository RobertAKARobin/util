import { Resolver, Router } from '@robertakarobin/web/router.ts';
import { LinkFactory } from '@robertakarobin/web/components/link.ts';

export const router = new Router({
	error404: `/404.html`,
	external: `https://example.com`,
	home: `/`,
	homeJump1: `/#jump1`,
	homeJump2: `/#jump2`,
	ssgNo: `/ssg/no`,
	ssgYes: `/ssg/yes`,
	ssgYesJump1: `/ssg/yes/#jump1`,
	ssgYesJump2: `/ssg/yes/#jump2`,
});

export const { paths, hashes, routeNames, urls } = router;

export const resolver = new Resolver(router, async(route: URL) => {
	switch (route.pathname) {
		case paths.home:
		case paths.homeJump1:
		case paths.homeJump2:
			return new (await import(`@src/pages/index.ts`)).IndexPage({
				title: `Home page`,
			}).set({
				message: `This is a variable`,
			});
		case paths.ssgNo:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage({
				title: `SSG no`,
			});
		case paths.ssgYes:
		case paths.ssgYesJump1:
		case paths.ssgYesJump2:
			return new (await import(`@src/pages/ssg-yes.ts`)).YesSSGPage({
				title: `SSG yes`,
			});
	}
	return new (await import(`@src/pages/error.ts`)).ErrorPage({
		title: `Error 404`,
	});
});

export const Link = LinkFactory(router);
