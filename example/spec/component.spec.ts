import '@robertakarobin/ssg/dummydom.ts';

import { suite, test } from '@robertakarobin/util/spec/index.ts';
import { Component } from '@robertakarobin/util/component.ts';

@Component.define()
class Widget extends Component.custom(`h1`) {
	@Component.attribute() attr = `attrDefault`;
	@Component.attribute({ name: `data-attr` }) dataAttr = `dataAttrDefault`;

	template = () => `content:${this.content ?? ``}`;
}

export const spec = suite(`Component`, {},
	test(`contents`, $ => {
		let widget: Widget;

		$.assert(x => x(new Widget(`ID`).outerHTML) === x(`<h1 id="ID" is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(new Widget().outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(new Widget().write(`x`).outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(new Widget().write(`x`).render().outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault">content:x</h1>`));

		$.log(() => widget = new Widget());
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(widget.innerHTML) === ``);
		$.assert(x => x(widget.render().outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault">content:</h1>`));
		$.assert(x => x(widget.innerHTML) === `content:`);

		$.assert(x => x(widget.write(`x`).outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault">content:</h1>`));
		$.assert(x => x(widget.render().innerHTML) === `content:x`);
		$.assert(x => x(widget.write(`y`).outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault">content:x</h1>`));
		$.assert(x => x(widget.render().innerHTML) === x(`content:y`));
	}),

	test(`attributes`, $ => {
		let widget: Widget;

		$.log(() => widget = new Widget());
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.log(() => widget.set({ class: `foo` }));
		$.assert(x => x(widget.className) === `foo`);
		$.log(() => widget.set({ class: `bar` }));
		$.assert(x => x(widget.className) === `bar`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault" class="${widget.getAttribute(`class`)}"></h1>`));

		$.log(() => widget.set({ class: undefined }));
		$.assert(x => x(widget.className) === ``);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));

		$.assert(x => x(widget.style.color) === ``);
		$.log(() => widget.set({ style: { color: `red` } }));
		$.assert(x => x(widget.style.color) === `red`);
		$.assert(x => x(widget.getAttribute(`style`)) === `color: red;`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault" style="${widget.getAttribute(`style`)}"></h1>`));
		$.assert(x => x(widget.style.top) === ``);
		$.log(() => widget.set({ style: { top: `1px` } }));
		$.assert(x => x(widget.style.top) === `1px`);
		$.assert(x => x(widget.getAttribute(`style`)) === `color: red; top: 1px;`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault" style="${widget.getAttribute(`style`)}"></h1>`));
		$.log(() => widget.set({ style: undefined }));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));

		$.log(() => widget.set({ attr: `foo` }));
		$.assert(x => x(widget.attr) === `foo`);
		$.assert(x => x(widget.getAttribute(`attr`)) === `foo`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="foo" data-attr="dataAttrDefault"></h1>`));

		$.log(() => widget.set({ attr: undefined }));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" data-attr="dataAttrDefault"></h1>`));

		$.log(() => widget.set({ dataAttr: `foo` }));
		$.assert(x => x(widget.dataAttr) === `foo`);
		$.assert(x => x(widget.getAttribute(`data-attr`)) === `foo`);
		$.log(() => widget.setAttribute(`data-attr`, `bar`));
		$.assert(x => x(widget.dataAttr) === `bar`);
	}),

	test(`<host>`, $ => {
		let widget = new Widget();

		$.log(() => widget.template = () => `<host title="foo">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`title`)) === `foo`);
		$.assert(x => x(widget.title) === `foo`);

		widget = new Widget();
		$.log(() => widget.template = () => `<host attr="aaa">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`attr`)) === `aaa`);
		$.assert(x => x(widget.attr) === `aaa`);

		widget = new Widget();
		$.log(() => widget.template = () => `<host data-attr="aaa">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`data-attr`)) === `aaa`);
		$.assert(x => x(widget.dataAttr) === `aaa`);

		widget = new Widget();
		$.log(() => widget.template = () => `<b><host attr="bbb">${widget.content ?? ``}</host></b>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`attr`)) === `attrDefault`);
		$.assert(x => x(widget.findDown(`b`).getAttribute(`attr`)) === `bbb`);
	}),
);
