import { suite, test } from '@robertakarobin/util/spec/index.ts';
import { Component } from '@robertakarobin/util/component.ts';
import { diff } from '@robertakarobin/util/spec/diff.ts';
import { EntityStateEmitter } from '@robertakarobin/util/entities.ts';

import fs from 'fs';

export const hasMarkdown = /<markdown>(.*?)<\/markdown>/gs;

EntityStateEmitter.prototype.createId = ()  => `/UID/`;
Component.createId = () => `/UID/`;

const read = (path: string) => fs.readFileSync(path, { encoding: `utf8` });

const dist = (path: string) => read(`dist/${path}`);
const golden = (path: string) => read(`dist-golden/${path}`);
const src = (path: string) => read(`src/${path}`);

const distMatchesGolden = (path: string) =>
	diff(golden(path), dist(path));

const hasSSG = (page: string) =>
	fs.existsSync(`dist/${page}.html`);

type WidgetType = { message: string; prop: number; };
class Widget extends Component<WidgetType> {
	constructor(...args: ConstructorParameters<typeof Component<WidgetType>>) {
		super(...args);
		this.set({ prop: 42 });
	}
	template = () => `<h1>${this.value.message ?? ``}${this.value.prop}</h1>`;
}

export const spec = suite(`@robertakarobin/web`,
	{
		args: async() => {
			await import(`../build.ts`);
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
		$.assert(x => x(new Widget().set({ message: `x` }).template()) === `<h1>x42</h1>`);
		$.assert(x => x(new Widget().set({ message: `x` }).template()) === `<h1>x42</h1>`);
		$.assert(x => x(new Widget(`id`).set({ message: `x` }).template()) === `<h1>x42</h1>`);
	}),
);
