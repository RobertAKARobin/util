import { execSync } from 'child_process';

import { Builder } from '@robertakarobin/ssg/build.ts';

class CustomBuilder extends Builder {
	cleanup() {
		try {
			execSync(`npm run lint`, { encoding: `utf8`, stdio: `inherit` });
		} catch (error) {
		}
	}
}

const builder = new CustomBuilder({
	esbuild: {
		minify: false,
	},
	metaFileRel: `./meta.json`,
});

await builder.build({ serve: process.argv.includes(`--serve`) });
