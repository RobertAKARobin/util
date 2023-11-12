import fs from 'fs';

import { suite, test } from '@robertakarobin/spec';
import { diff } from '@robertakarobin/spec/diff.ts';

import { hasMarkdown } from '../router.ts';

const dist = (path: string) =>
	fs.readFileSync(`web/example/dist/${path}`, { encoding: `utf8` });
const golden = (path: string) =>
	fs.readFileSync(`web/example/dist-golden/${path}`, { encoding: `utf8` });
const src = (path: string) =>
	fs.readFileSync(`web/example/src/${path}`, { encoding: `utf8` });

const distMatchesGolden = (path: string) =>
	diff(dist(path), golden(path));

const hasSSG = (page: string) =>
	fs.existsSync(`web/example/dist/${page}.html`);

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

		$.assert(() => hasSSG(`404`));
		$.assert(() => hasSSG(`index`));
		$.assert(() => hasSSG(`ssg/yes/index`));
		$.assert(() => !hasSSG(`ssg/no/index`));

		$.assert(() => hasMarkdown.test(src(`pages/index.ts`)));
		$.assert(() => !hasMarkdown.test(dist(`index.html`)));
	}),
);
