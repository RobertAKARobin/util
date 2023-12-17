import { Resolver, Router } from '@robertakarobin/web/router.ts';

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

export const { paths, hashes, urls } = router;

export const resolver = new Resolver(router, async(route: URL) => {
	switch (route.pathname) {
		case paths.home:
		case paths.homeJump1:
		case paths.homeJump2:
			return new (await import(`@src/pages/index.ts`)).IndexPage(undefined, {
				message: `This is a variable`,
				title: `Home page`,
			});
		case paths.ssgNo:
			return new (await import(`@src/pages/ssg-no.ts`)).NoSSGPage(undefined, {
				title: `No SSG page`,
			});
		case paths.ssgYes:
		case paths.ssgYesJump1:
		case paths.ssgYesJump2:
			return new (await import(`@src/pages/ssg-yes.ts`)).YesSSGPage(undefined, {
				title: `SSG yes`,
			});
	}
	return new (await import(`@src/pages/error.ts`)).ErrorPage(undefined, {
		title: `Error 404`,
	});
});
