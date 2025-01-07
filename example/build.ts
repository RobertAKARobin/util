import { execSync } from 'child_process';

import { Builder } from '@robertakarobin/util/util/components/build';

import { execUntil } from '../util/node/execUntil';
import { routes } from '@src/routes';

class CustomBuilder extends Builder {
	override cleanup() {
		execUntil(`eslint --quiet --fix dist/**/*.html`, { attemptsMax: 10 });
		execUntil(`stylelint --fix dist/**/*.css && stylelint --quiet dist/**/*.css`, { attemptsMax: 10 });
		execSync(`npm run lint:ts`, { encoding: `utf8`, stdio: `inherit` });
		execSync(`npm run lint:css`, { encoding: `utf8`, stdio: `inherit` });
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
