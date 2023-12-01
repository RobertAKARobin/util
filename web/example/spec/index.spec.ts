import { Component } from '@robertakarobin/web/component.ts';
import { EntityStateEmitter } from '@robertakarobin/jsutil/entities.ts';
import fs from 'fs';

import { suite, test } from '@robertakarobin/spec';
import { diff } from '@robertakarobin/spec/diff.ts';


export const hasMarkdown = /<markdown>(.*?)<\/markdown>/gs;

EntityStateEmitter.prototype.createId = ()  => `/UID/`;
Component.createUid = () => `/UID/`;

const read = (path: string) => fs.readFileSync(path, { encoding: `utf8` });

const dist = (path: string) => read(`dist/${path}`);
const golden = (path: string) => read(`dist-golden/${path}`);
const src = (path: string) => read(`src/${path}`);

const distMatchesGolden = (path: string) =>
	diff(golden(path), dist(path));

const hasSSG = (page: string) =>
	fs.existsSync(`dist/${page}.html`);

class Widget extends Component {
	message: string;
	prop = 42;

	constructor({ message, ...attributes }: {
		id?: string;
		message: string;
	}) {
		super(attributes);
		this.message = message;
	}

	template = () => `<h1>${this.message ?? ``}${this.prop}</h1>`;
}

const widget = Component.toFunction(Widget);

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
		$.assert(x => x(new Widget({ message: `x` }).template()) === `<h1>x42</h1>`);
		$.assert(x => x(widget({ message: `x` }).render()) === `<h1 data-component="Widget" id="/UID/">x42</h1>`);
		$.assert(x => x(widget({ id: `steve`, message: `x` }).render()) === `<h1 data-component="Widget" id="steve">x42</h1>`);
	}),
);
