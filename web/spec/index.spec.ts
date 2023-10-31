import fs from 'fs';

import { suite, test } from '@robertakarobin/spec';
import { diff } from '@robertakarobin/spec/diff.ts';

const dist = (path: string) => fs.readFileSync(`web/example/dist/${path}`, { encoding: `utf8` });
const golden = (path: string) => fs.readFileSync(`web/example/dist-golden/${path}`, { encoding: `utf8` });

export const spec = suite(`@robertakarobin/web`,
	{
		args: async() => {
			await import(`../example/build.ts`);
		},
	},

	test(`build`, $ => {
		$.assert(x => x(diff(dist(`styles.css`), golden(`styles.css`))) === ``);
		$.assert(x => x(diff(dist(`script.js`), golden(`script.js`))) === ``);
		$.assert(x => x(diff(dist(`index.html`), golden(`index.html`))) === ``);
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
