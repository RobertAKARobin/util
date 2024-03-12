import '@robertakarobin/util/dom/dummydom.ts';

import { suite, test } from '@robertakarobin/util/spec/index.ts';
import { Component } from '@robertakarobin/util/components/component.ts';

@Component.define()
class Widget extends Component.custom(`h1`) {
	@Component.attribute() attr = `attrDefault`;
	@Component.attribute({ name: `data-attr` }) dataAttr = `dataAttrDefault`;

	template = () => `content:${this.content ?? ``}`;
}

@Component.define()
class Parent extends Component.custom(`div`) {
	@Component.attribute() widgetClass = undefined as string | undefined;
	template = () => Widget.id(`child`).set({
		attr: undefined,
		class: this.widgetClass,
		dataAttr: undefined,
	}).toString();
}

export const spec = suite(`Component`, {},
	test(`contents`, $ => {
		let widget: Widget;

		$.assert(x => x(Widget.id(`WID`).outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(Widget.id(`WID`).outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(Widget.id(`WID`).write(`x`).outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(Widget.id(`WID`).write(`x`).render().outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault">content:x</h1>`));

		$.log(() => widget = Widget.id(`WID`));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.assert(x => x(widget.innerHTML) === ``);
		$.assert(x => x(widget.render().outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault">content:</h1>`));
		$.assert(x => x(widget.innerHTML) === `content:`);

		$.assert(x => x(widget.write(`x`).outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault">content:</h1>`));
		$.assert(x => x(widget.render().innerHTML) === `content:x`);
		$.assert(x => x(widget.write(`y`).outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault">content:x</h1>`));
		$.assert(x => x(widget.render().innerHTML) === x(`content:y`));

		$.log(() => widget.template = () => `<b>${widget.content ?? ``}</b>`);
		widget!.render();
		$.assert(x => x(widget.innerHTML) === `<b>y</b>`);
		$.log(() => widget.render(`b`));
		$.assert(x => x(widget.innerHTML) === `<b>y</b>`);
	}),

	test(`attributes`, $ => {
		let widget: Widget;

		$.log(() => widget = Widget.id(`WID`));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
		$.log(() => widget.set({ class: `foo` }));
		$.assert(x => x(widget.className) === `foo`);
		$.log(() => widget.set({ class: `bar` }));
		$.assert(x => x(widget.className) === `bar`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault" class="${widget.getAttribute(`class`)}"></h1>`));

		$.log(() => widget.set({ class: undefined }));
		$.assert(x => x(widget.className) === ``);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));

		$.assert(x => x(widget.style.color) === ``);
		$.log(() => widget.css({ color: `red` }));
		$.assert(x => x(widget.style.color) === `red`);
		$.assert(x => x(widget.getAttribute(`style`)) === `color: red;`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault" style="${widget.getAttribute(`style`)}"></h1>`));
		$.assert(x => x(widget.style.top) === ``);
		$.log(() => widget.css({ top: `1px` }));
		$.assert(x => x(widget.style.top) === `1px`);
		$.assert(x => x(widget.getAttribute(`style`)) === `color: red; top: 1px;`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault" style="${widget.getAttribute(`style`)}"></h1>`));
		$.log(() => widget.set({ style: `color: green` }));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault" style="color: green;"></h1>`));
		$.log(() => widget.set({ style: undefined }));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));

		$.log(() => widget.set({ attr: `foo` }));
		$.assert(x => x(widget.attr) === `foo`);
		$.assert(x => x(widget.getAttribute(`attr`)) === `foo`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" attr="foo" data-attr="dataAttrDefault"></h1>`));

		$.log(() => widget.set({ attr: undefined }));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" id="WID" data-attr="dataAttrDefault"></h1>`));

		$.log(() => widget.set({ dataAttr: `foo` }));
		$.assert(x => x(widget.dataAttr) === `foo`);
		$.assert(x => x(widget.getAttribute(`data-attr`)) === `foo`);
		$.log(() => widget.setAttribute(`data-attr`, `bar`));
		$.assert(x => x(widget.dataAttr) === `bar`);
	}),

	test(`<host>`, $ => {
		let widget = Widget.id(`WID`);

		$.log(() => widget.template = () => `<host title="foo">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`title`)) === `foo`);
		$.assert(x => x(widget.title) === `foo`);

		widget = Widget.id(`WID`);
		$.log(() => widget.template = () => `<host attr="aaa">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`attr`)) === `aaa`);
		$.assert(x => x(widget.attr) === `aaa`);

		widget = Widget.id(`WID`);
		$.log(() => widget.template = () => `<host data-attr="aaa">${widget.content ?? ``}</host>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`data-attr`)) === `aaa`);
		$.assert(x => x(widget.dataAttr) === `aaa`);

		widget = Widget.id(`WID`);
		$.log(() => widget.template = () => `<b><host attr="bbb">${widget.content ?? ``}</host></b>`);
		widget.render();
		$.assert(x => x(widget.getAttribute(`attr`)) === `attrDefault`);
		$.assert(x => x(widget.findDown(`b`).getAttribute(`attr`)) === `bbb`);
	}),

	test(`nested`, $ => {
		const parent = Parent.id(`PID`);

		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" id="PID"></div>`));
		$.log(() => parent.render());
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" id="PID"><h1 is="l-widget" id="child">content:</h1></div>`));
		$.log(() => parent.set({ widgetClass: `foo` }));
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" id="PID" widgetclass="foo"><h1 is="l-widget" id="child">content:</h1></div>`));
		$.log(() => parent.render());
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" id="PID" widgetclass="foo"><h1 is="l-widget" id="child" class="foo">content:</h1></div>`));
	}),
);
