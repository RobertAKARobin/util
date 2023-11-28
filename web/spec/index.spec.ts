import fs from 'fs';

import { suite, test } from '@robertakarobin/spec';
import { diff } from '@robertakarobin/spec/diff.ts';

import { Component } from '../component.ts';

export const hasMarkdown = /<markdown>(.*?)<\/markdown>/gs;

Component.createUid = () => `/UID/`;

const read = (path: string) => fs.readFileSync(path, { encoding: `utf8` });

const dist = (path: string) => read(`web/example/dist/${path}`);
const golden = (path: string) => read(`web/example/dist-golden/${path}`);
const src = (path: string) => read(`web/example/src/${path}`);

const distMatchesGolden = (path: string) =>
	diff(golden(path), dist(path));

const hasSSG = (page: string) =>
	fs.existsSync(`web/example/dist/${page}.html`);

class Widget extends Component {
	prop = 42;
	constructor(
		public message: string,
	) {
		super();
	}

	template = () => `<h1>${this.message}${this.prop}</h1>`;
}

const widget = Component.toFunction(Widget);

export const spec = suite(`@robertakarobin/web`,
	{
		args: async() => {
			await import(`../example/build.ts`);
		},
	},

	test(`build`, $ => {
		$.assert(x => x(distMatchesGolden(`ssg/yes/index.html`)) === ``);
		$.assert(x => x(distMatchesGolden(`ssg/yes/index.html.css`)) === ``);
		$.assert(x => x(distMatchesGolden(`404.html`)) === ``);
		$.assert(x => x(distMatchesGolden(`index.html`)) === ``);
		$.assert(x => x(distMatchesGolden(`index.html.css`)) === ``);
		$.assert(x => x(distMatchesGolden(`styles.css`)) === ``);

		$.assert(() => hasSSG(`404`));
		$.assert(() => hasSSG(`index`));
		$.assert(() => hasSSG(`ssg/yes/index`));
		$.assert(() => !hasSSG(`ssg/no/index`));

		$.assert(() => hasMarkdown.test(src(`pages/index.ts`)));
		$.assert(() => !hasMarkdown.test(dist(`index.html`)));
	}),

	test(`component`, $ => {
		$.assert(x => x(new Widget(`x`).template()) === `<h1>x42</h1>`);
		$.assert(x => x(widget(`x`).render()) === `<script src="data:text/javascript," onload="window.Component=window.Component||[];window.Component.push([this,'Widget','x'])"></script><h1>x42</h1>`);
	}),
);
