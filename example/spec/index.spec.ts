import '@robertakarobin/web/dummydom.ts';

import { suite, test } from '@robertakarobin/util/spec/index.ts';
import { diff } from '@robertakarobin/util/spec/diff.ts';
import { EntityStateEmitter } from '@robertakarobin/util/entities.ts';

import { Component, type RenderMode } from '@robertakarobin/web/component.ts';

import fs from 'fs';

let id = 0;
EntityStateEmitter.prototype.createId = () => { // Easy to strip out with RegEx
	return `UID${++id}_`;
};

export const hasMarkdown = /<markdown>(.*?)<\/markdown>/gs;

const read = (path: string) => fs.readFileSync(path, { encoding: `utf8` })
	.replace(/UID\d+_/g, `UID`) // Note that this will make it look like some IDs are repeated
	.replace(/\?cache=\d+/g, `?cache=123`)
	.replace(/-[A-Z0-9]{8}\.js/g, `.js`);

const dist = (path: string) => read(`dist/${path}`);
const golden = (path: string) => read(`dist-golden/${path}`);
const src = (path: string) => read(`src/${path}`);

const distMatchesGolden = (path: string) =>
	diff(golden(path), dist(path));

const hasSSG = (page: string) =>
	fs.existsSync(`dist/${page}.html`);

@Component.define()
class Widget extends Component.custom(`h1`) {
	color: string = ``;
	@Component.attribute() message = undefined as undefined | string | number;
	@Component.attribute() prop = 42;

	template = () => `${this.message ?? ``}${this.prop}`;
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
		let widget: Widget;

		$.assert(x => x(new Widget(`ID`).outerHTML) === `<h1 id="ID" is="l-widget" prop="42"></h1>`);
		$.assert(x => x(new Widget().outerHTML) === `<h1 is="l-widget" prop="42"></h1>`);
		$.assert(x => x(new Widget().set({ message: `x` }).outerHTML) === `<h1 is="l-widget" prop="42" message="x"></h1>`);
		$.assert(x => x(new Widget().set({ message: `x` }).render().outerHTML) === `<h1 is="l-widget" prop="42" message="x">x42</h1>`);

		$.log(() => widget = new Widget());
		$.assert(x => x(widget.outerHTML) === `<h1 is="l-widget" prop="42"></h1>`);
		$.assert(x => x(widget.innerHTML) === ``);
		$.assert(x => x(widget.render().outerHTML) === `<h1 is="l-widget" prop="42">42</h1>`);
		$.assert(x => x(widget.innerHTML) === `42`);

		$.assert(x => x(widget.set({ message: `x` }).outerHTML) === `<h1 is="l-widget" prop="42" message="x">42</h1>`);
		$.assert(x => x(widget.render({ force: true }).outerHTML) === `<h1 is="l-widget" prop="42" message="x">x42</h1>`);
		$.assert(x => x(widget.innerHTML) === `x42`);

		$.assert(x => x(widget.set({ message: undefined }).outerHTML) === `<h1 is="l-widget" prop="42">x42</h1>`);
		$.assert(x => x(widget.render({ force: true }).outerHTML) === `<h1 is="l-widget" prop="42">42</h1>`);

		$.assert(x => x(new Widget().set({ prop: 43 }).getAttribute(`prop`)) === `43`);

		widget = new Widget();
		const set = (input: {
			message: number;
			render?: RenderMode;
		}) => {
			widget.template = () =>  `<a id="ID" ${typeof input.render === `string` ? `data-render="${input.render}" ` : ``}message="${widget.message}">${widget.message}</a>`;
			widget.set({ message: input.message }).render();
		};
		const a = () => widget.querySelector(`a`)!;

		$.log(() => set({ message: 1 }));
		$.assert(x => x(a().getAttribute(`message`)) === `1`);
		$.assert(x => x(a().textContent) === `1`);

		$.log(() => set({ message: 2, render: `static` }));
		$.assert(x => x(a().getAttribute(`message`)) === `1`);
		$.assert(x => x(a().textContent) === `1`);

		$.log(() => set({ message: 3, render: `attr` }));
		$.assert(x => x(a().getAttribute(`message`)) === `3`);
		$.assert(x => x(a().textContent) === `1`);

		$.log(() => set({ message: 4, render: `inner` }));
		$.assert(x => x(a().getAttribute(`message`)) === `3`);
		$.assert(x => x(a().textContent) === `4`);

		$.log(() => set({ message: 5, render: `outer` }));
		$.assert(x => x(a().getAttribute(`message`)) === `5`);
		$.assert(x => x(a().textContent) === `5`);

		$.log(() => set({ message: 6, render: `el` }));
		$.assert(x => x(a().getAttribute(`message`)) === `6`);
		$.assert(x => x(a().textContent) === `6`);

		$.log(() => set({ message: 7 }));
		$.assert(x => x(a().getAttribute(`message`)) === `7`);
		$.assert(x => x(a().textContent) === `7`);

		widget = new Widget();
		$.log(() => widget.template = () => `<host title="foo">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`title`)) === `foo`);

		$.log(() => widget.template = () => `<host foo="red">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`foo`)) === `red`);
	}),
);
