import { execSync } from 'child_process';

import { Builder } from '@robertakarobin/web/build.ts';

class CustomBuilder extends Builder {
	cleanup() {
		try {
			execSync(`npm run lint`, { encoding: `utf8`, stdio: `inherit` });
		} catch (error) {
		}
	}
}

const builder = new CustomBuilder({
	metaFileRel: `./meta.json`,
	minify: false,
});

await builder.build({ serve: process.argv.includes(`--serve`) });
