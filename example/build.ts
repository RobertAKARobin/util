import { execSync } from 'child_process';

import { Builder } from '@robertakarobin/ssg/build.ts';

import { routes } from '@src/routes.ts';

class CustomBuilder extends Builder {
	cleanup() {
		try {
			execSync(`npm run lint`, { encoding: `utf8`, stdio: `inherit` });
		} catch (error) {
		}
	}
}

const ssgRoutesByName: Record<string, string> = { ...routes };
delete ssgRoutesByName[`ssgNo`];
const ssgRoutes = Object.values(ssgRoutesByName);

const builder = new CustomBuilder({
	esbuild: {
		minify: false,
	},
	esbuildServe: {
		fallback: `dist/index.html`,
	},
	metaFileRel: `./meta.json`,
	ssgRoutes,
});

await builder.build({ serve: process.argv.includes(`--serve`) });
