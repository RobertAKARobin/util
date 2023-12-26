import { Resolver, Router } from '@robertakarobin/web/router.ts';
import { LinkComponent } from '@robertakarobin/web/components/link.ts';

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
				'data-message': `This is a variable`,
				'data-page-title': `Home page`,
			});
		case paths.ssgNo:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage({
			});
		case paths.ssgYes:
		case paths.ssgYesJump1:
		case paths.ssgYesJump2:
			return new (await import(`@src/pages/ssg-yes.ts`)).YesSSGPage({
				'data-page-title': `SSG yes`,
			});
	}
	return new (await import(`@src/pages/error.ts`)).ErrorPage({
		'data-page-title': `Error 404`,
	});
});

export const Link = LinkComponent(router);
