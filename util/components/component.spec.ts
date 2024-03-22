import '@robertakarobin/util/dom/dummydom.ts';

import { suite, test } from '@robertakarobin/util/spec/index.ts';
import { Component } from '@robertakarobin/util/components/component.ts';
import { Emitter } from 'util/emitter/emitter.ts';

@Component.define()
class Widget extends Component.custom(`h1`) {
	@Component.attribute() attr = `attrDefault`;
	@Component.attribute({ name: `data-attr` }) dataAttr = `dataAttrDefault`;

	template = () => `content:${this.content ?? ``}`;
}

@Component.define()
class Parent extends Component.custom(`div`) {
	widget = this.findDown(Widget);
	@Component.attribute() widgetClass = undefined as string | undefined;

	template = () => new Widget().set({
		attr: undefined,
		class: this.widgetClass,
		dataAttr: undefined,
	}).toString();
}

@Component.define()
class EventListener extends Component {
	capValue = ``;
	listenerValue = 3;
	source = this.findDown(EventSource);

	@Component.event() capUp(input: string) {
		return input.toUpperCase();
	}

	onDispatch(event: CustomEvent<number>) {
		this.listenerValue += event.detail;
	}

	template = () => /*html*/`
${EventSource.id(`source`)
	.setTime()
	.on(`doDispatch`, this, `onDispatch`)
}
	`;
}

@Component.define()
class EventSource extends Component {
	static count = 0;
	button = this.findDown(`button`);
	index: number;
	sourceValue = 0;
	@Component.attribute() time = performance.now();

	constructor() {
		super();

		EventSource.count += 1;
		this.index = EventSource.count;
	}

	@Component.event() doDispatch() {
		return this.sourceValue;
	}

	setTime() {
		const time = performance.now();
		this.time = time;
		return this;
	}

	template = () => /*html*/`
<button ${this.on(`click`, `doDispatch`)}></button>
	`;
}

export const spec = suite(`Component`, {},
	test(`contents`, $ => {
		let widget: Widget;

		$.assert(x => x(new Widget().outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault"></h1>`));
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

		$.log(() => widget.template = () => `<b>${widget.content ?? ``}</b>`);
		widget!.render();
		$.assert(x => x(widget.innerHTML) === `<b>y</b>`);
		$.log(() => widget.render(`b`));
		$.assert(x => x(widget.innerHTML) === `<b>y</b>`);
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
		$.log(() => widget.css({ color: `red` }));
		$.assert(x => x(widget.style.color) === `red`);
		$.assert(x => x(widget.getAttribute(`style`)) === `color: red;`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault" style="${widget.getAttribute(`style`)}"></h1>`));
		$.assert(x => x(widget.style.top) === ``);
		$.log(() => widget.css({ top: `1px` }));
		$.assert(x => x(widget.style.top) === `1px`);
		$.assert(x => x(widget.getAttribute(`style`)) === `color: red; top: 1px;`);
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault" style="${widget.getAttribute(`style`)}"></h1>`));
		$.log(() => widget.set({ style: `color: green` }));
		$.assert(x => x(widget.outerHTML) === x(`<h1 is="l-widget" attr="attrDefault" data-attr="dataAttrDefault" style="color: green;"></h1>`));
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
		$.assert(x => x(widget.findDown(`b`)().getAttribute(`attr`)) === `bbb`);
	}),

	test(`nested`, $ => {
		const parent = new Parent();

		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent"></div>`));
		$.log(() => parent.render());
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent"><h1 is="l-widget">content:</h1></div>`));

		$.log(() => parent.set({ widgetClass: `111` }));
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" widgetclass="111"><h1 is="l-widget">content:</h1></div>`));

		let existing = parent.widget();
		$.log(() => parent.render());
		$.assert(() => parent.widget() !== existing);
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" widgetclass="111"><h1 is="l-widget" class="111">content:</h1></div>`));

		existing = parent.widget();
		$.log(() => parent.set({ widgetClass: `333` }));
		$.log(() => parent.widget().render());
		$.assert(() => parent.widget() === existing);
		$.assert(() => parent.widget().className === `111`);
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" widgetclass="333"><h1 is="l-widget" class="111">content:</h1></div>`));

		existing = parent.widget();
		$.log(() => parent.set({ widgetClass: `222` }));
		$.log(() => parent.render(Widget.selector));
		$.assert(() => parent.widget() === existing);
		$.assert(() => parent.widget().className === `222`);
		$.assert(x => x(parent.outerHTML) === x(`<div is="l-parent" widgetclass="222"><h1 is="l-widget" class="222">content:</h1></div>`));
	}),

	test(`static ID`, $ => {
		const listener = new EventListener();
		let lastTime = performance.now();
		$.log(() => listener.render());
		$.assert(() => !(listener.isConnected));
		$.assert(() => !(listener.source().isConnected));
		$.assert(x => x(lastTime) < x(lastTime = listener.source().time));

		const existing = listener.source();
		$.log(() => document.body.appendChild(listener));
		$.log(() => listener.render());
		$.assert(() => listener.isConnected);
		$.assert(() => listener.source().isConnected);
		$.assert(() => listener.source() === existing);
		$.assert(x => x(listener.source().index) === 1);
		$.assert(x => x(EventSource.count) === 1);
		$.assert(x => x(lastTime) < x(lastTime = listener.source().time));

		$.log(() => listener.source().cloneNode()); // Causes constructor to run
		$.assert(x => x(listener.source().index) === 1);
		$.assert(x => x(EventSource.count) === 2);

		$.log(() => listener.render());
		$.assert(() => listener.isConnected);
		$.assert(() => listener.source().isConnected);
		$.assert(() => listener.source() === existing);
		$.assert(x => x(listener.source().index) === 1);
		$.assert(x => x(EventSource.count) === 2);
		$.assert(x => x(lastTime) < x(lastTime = listener.source().time));

		$.log(() => listener.source().render());
		$.assert(() => listener.source() === existing);
		$.assert(x => x(listener.source().index) === 1);
		$.assert(x => x(EventSource.count) === 2);
		$.assert(x => x(lastTime) === x(listener.source().time));

		$.log(() => listener.render(EventSource.selector));
		$.assert(() => listener.source() === existing);
		$.assert(x => x(listener.source().index) === 1);
		$.assert(x => x(EventSource.count) === 3);
		$.assert(x => x(lastTime) < x(listener.source().time));

		let disconnectedCount = 0;
		listener.source().on(`disconnected`, () => {
			disconnectedCount += 1;
		});

		$.assert(x => x(listener.source().isConnected));
		$.assert(x => x(disconnectedCount) === 0);

		$.log(() => listener.render());
		$.assert(x => x(listener.source().isConnected));
		$.assert(x => x(disconnectedCount) === 1);
	}),

	test(`events`, $ => {
		const listener = new EventListener();
		document.body.appendChild(listener);
		listener.render();

		$.assert(x => x(listener.listenerValue) === 3);
		listener.source().sourceValue = 2;
		$.log(() => listener.source().button().click());
		$.assert(x => x(listener.listenerValue) === 5);

		listener.source().sourceValue = 4.5;
		$.log(() => listener.source().button().click());
		$.assert(x => x(listener.listenerValue) === 9.5);


		let clickValue = 0;
		listener.on(`click`, () => clickValue += 1);
		listener.on(`click`, () => clickValue += 1);
		$.assert(x => x(clickValue) === 0);


		let capValue = ``;
		listener.on(`capUp`, event => capValue = event.detail);
		$.assert(x => x(capValue) === ``);

		$.log(() => listener.click());
		$.assert(x => x(clickValue) === 2);

		$.log(() => listener.capUp(`foo`));
		$.assert(x => x(capValue) === `FOO`);


		let timeEmissions = 0;
		listener.source().on(`time`, () => timeEmissions += 1);
		$.assert(x => x(timeEmissions) === 0);

		$.log(() => listener.source().setTime());
		$.assert(x => x(timeEmissions) === 1);

		$.log(() => listener.source().setTime());
		$.assert(x => x(timeEmissions) === 2);


		$.log(() => listener.remove());

		$.log(() => listener.click());
		$.assert(x => x(clickValue) === 2);

		$.log(() => listener.capUp(`foo`));
		$.assert(x => x(capValue) === `FOO`);

		$.log(() => listener.source().setTime());
		$.assert(x => x(timeEmissions) === 2);
	}),

	test(`watch`, $ => {
		const emitter = new Emitter(0);
		const listener = new EventListener();
		listener.listenerValue = 0;
		document.body.appendChild(listener);

		listener.watch(emitter).subscribe(value => listener.listenerValue = value);

		emitter.set(1);
		$.assert(x => x(listener.listenerValue) === 1);

		emitter.set(10);
		$.assert(x => x(listener.listenerValue) === 10);

		listener.remove();
		emitter.set(3);
		$.assert(x => x(listener.listenerValue) === 10);
	}),
);
