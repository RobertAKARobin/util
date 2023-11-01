import fs from 'fs';

import { suite, test } from '@robertakarobin/spec';
import { diff } from '@robertakarobin/spec/diff.ts';

const dist = (path: string) => fs.readFileSync(`web/example/dist/${path}`, { encoding: `utf8` });
const golden = (path: string) => fs.readFileSync(`web/example/dist-golden/${path}`, { encoding: `utf8` });

const distMatchesGolden = (path: string) => {
	return diff(dist(path), golden(path));
};

export const spec = suite(`@robertakarobin/web`,
	{
		args: async() => {
			await import(`../example/build.ts`);
		},
	},

	test(`build`, $ => {
		$.assert(x => x(distMatchesGolden(`styles.css`)) === ``);
		$.assert(x => x(distMatchesGolden(`index.html`)) === ``);
		$.assert(x => x(distMatchesGolden(`404.html`)) === ``);
	}),

	// test(`all`, $ => {
	// 	$.log(`should generate a main JS bundle w base Web JS`);
	// 	$.log(`each route should build a full HTML page`);
	// 	$.log(`each route page should have matching JS bundle?`);
	// 	$.log(`each route page bundle should not re-bundle shared JS`);
	// 	$.log(`each static should build a JS bundle?`);
	// 	// baseDir/distDir
	// }),
);
