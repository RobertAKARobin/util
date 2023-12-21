import { suite, test } from '@robertakarobin/util/spec/index.ts';
import { diff } from '@robertakarobin/util/spec/diff.ts';
import { EntityStateEmitter } from '@robertakarobin/util/entities.ts';

import { Component } from '@robertakarobin/web/component.ts';

import fs from 'fs';

let id = 0;
EntityStateEmitter.prototype.createId = Component.createId = () => { // Easy to strip out with RegEx
	return `UID${++id}_`;
};

export const hasMarkdown = /<markdown>(.*?)<\/markdown>/gs;

const read = (path: string) => fs.readFileSync(path, { encoding: `utf8` })
	.replace(/UID\d+_/g, `UID`) // Note that this will make it look like some IDs are repeated
	.replace(/\?cache=\d+/g, `?cache=123`);

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
		this.set({ ...this.value, prop: 42 });
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
		$.assert(x => x(new Widget().patch({ message: `x` }).template()) === `<h1>x42</h1>`);
		$.assert(x => x(new Widget().patch({ message: `x` }).template()) === `<h1>x42</h1>`);
		$.assert(x => x(new Widget(`id`).patch({ message: `x` }).template()) === `<h1>x42</h1>`);

		let widget: Widget;
		id = 0;
		$.log(() => widget = new Widget());
		$.log(() => widget.render());
		$.assert(x => x(widget.$el.outerHTML) === x(`<h1 id="UID1_" is="l-widget">42</h1>`));
		$.assert(x => x(widget.attrs({ class: `foo` }).$el.outerHTML) === x(`<h1 id="UID1_" is="l-widget" class="foo">42</h1>`));
		$.assert(x => x(widget.attrs({ class: null }).$el.outerHTML) === x(`<h1 id="UID1_" is="l-widget">42</h1>`));
		$.assert(x => x(widget.attrs({ class: `foo` }).attrs({ class: null }).$el.outerHTML) === x(`<h1 id="UID1_" is="l-widget">42</h1>`));

		// Assert setting attributes does not trigger onChange
		// Assert setting dataAttributes triggers onChange
	}),
);
