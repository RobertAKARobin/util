import { suite, test } from '@robertakarobin/util/spec/index.ts';
import { diff } from '@robertakarobin/util/spec/diff.ts';
import { EntityStateEmitter } from '@robertakarobin/util/entities.ts';

import { ComponentFactory } from '@robertakarobin/web/component.ts';
import { DummyDOM } from '@robertakarobin/web/dummydom.ts';

import fs from 'fs';

let id = 0;
EntityStateEmitter.prototype.createId = ComponentFactory.createId = () => { // Easy to strip out with RegEx
	return `UID${++id}_`;
};

new DummyDOM();

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

class Widget extends ComponentFactory(`h1`, {
	message: undefined as unknown as string,
	prop: 42,
}) {
	static {
		this.init();
	}
	template = () => `${this.get(`message`) ?? ``}${this.get(`prop`)}`;
}

export const spec = suite(`@robertakarobin/web`,
	{
		args: async() => {
			// await import(`../build.ts`);
		},
	},

	// test(`build`, $ => {
	// 	$.assert(x => x(distMatchesGolden(`ssg/yes/index.html`)) === ``);
	// 	$.assert(x => x(distMatchesGolden(`ssg/yes/index.html.css`)) === ``);
	// 	$.assert(x => x(distMatchesGolden(`404.html`)) === ``);
	// 	$.assert(x => x(distMatchesGolden(`index.html`)) === ``);
	// 	$.assert(x => x(distMatchesGolden(`index.html.css`)) === ``);
	// 	$.assert(x => x(distMatchesGolden(`styles.css`)) === ``);

	// 	$.assert(() => hasSSG(`404`));
	// 	$.assert(() => hasSSG(`index`));
	// 	$.assert(() => hasSSG(`ssg/yes/index`));
	// 	$.assert(() => !hasSSG(`ssg/no/index`));

	// 	$.assert(() => hasMarkdown.test(src(`pages/index.ts`)));
	// 	$.assert(() => !hasMarkdown.test(dist(`index.html`)));
	// }),

	test(`component`, $ => {
		id = 0;
		$.assert(x => x(new Widget({ message: `x` }).outerHTML) === `<h1 message="x" prop="42" id="UID1_" is="l-widget"></h1>`);

		id = 0;
		$.assert(x => x(new Widget({ message: `x` }).render().outerHTML) === `<h1 message="x" prop="42" id="UID1_" is="l-widget">x42</h1>`);
		// $.assert(x => x(new Widget({ id: `id` }).setAttributes({ message: `x` }).template()) === `<h1>x42</h1>`);

		let widget: Widget;
		id = 0;
		$.log(() => widget = new Widget());
		$.assert(x => x(widget.outerHTML) === `<h1 prop="42" id="UID1_" is="l-widget"></h1>`);
		$.assert(x => x(widget.render().outerHTML) === `<h1 prop="42" id="UID1_" is="l-widget">42</h1>`);
		$.assert(x => x(widget.setAttributes({ message: `x` }).outerHTML) === `<h1 prop="42" id="UID1_" is="l-widget" message="x">42</h1>`);
		$.assert(x => x(widget.render().outerHTML) === `<h1 prop="42" id="UID1_" is="l-widget" message="x">x42</h1>`);
		$.assert(x => x(widget.setAttributes({ message: null }).outerHTML) === `<h1 prop="42" id="UID1_" is="l-widget">x42</h1>`);
		$.assert(x => x(widget.render().outerHTML) === `<h1 prop="42" id="UID1_" is="l-widget">42</h1>`);
	}),
);
