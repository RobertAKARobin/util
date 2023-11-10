import fs from 'fs';

import { suite, test } from '@robertakarobin/spec';
import { diff } from '@robertakarobin/spec/diff.ts';

const dist = (path: string) =>
	fs.readFileSync(`web/example/dist/${path}`, { encoding: `utf8` });
const golden = (path: string) =>
	fs.readFileSync(`web/example/dist-golden/${path}`, { encoding: `utf8` });

const distMatchesGolden = (path: string) =>
	diff(dist(path), golden(path));

const hasFallback = (page: string) =>
	fs.existsSync(`web/example/dist/${page}.html`);

const hasSplit = (page: string) =>
	fs.existsSync(`web/example/dist/${page}.html.js`);

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
		$.assert(x => x(distMatchesGolden(`index.html.js`)) === ``);
		$.assert(x => x(distMatchesGolden(`404.html.js`)) === ``);

		const mainScript = fs.readFileSync(`web/example/dist/script.js`, { encoding: `utf8` });

		const isDynamic = (page: string) =>
			mainScript.includes(`import("/${page}.html.js")`);

		$.assert(() => hasFallback(`404`));
		$.assert(() => hasSplit(`404`));
		$.assert(() => isDynamic(`404`));

		$.assert(() => hasFallback(`index`));
		$.assert(() => hasSplit(`index`));
		$.assert(() => isDynamic(`index`));

		$.assert(() => !hasFallback(`nosplit-nofallback`));
		$.assert(() => !hasSplit(`nosplit-nofallback`));
		$.assert(() => !isDynamic(`nosplit-nofallback`));

		$.assert(() => hasFallback(`nosplit/index`));
		$.assert(() => !hasSplit(`nosplit/index`));
		$.assert(() => !isDynamic(`nosplit/index`));

		$.assert(() => !hasFallback(`split-nofallback/index`));
		$.assert(() => hasSplit(`split-nofallback/index`));
		$.assert(() => isDynamic(`split-nofallback/index`));

		$.assert(() => hasFallback(`split/index`));
		$.assert(() => hasSplit(`split/index`));
		$.assert(() => isDynamic(`split/index`));
	}),
);
