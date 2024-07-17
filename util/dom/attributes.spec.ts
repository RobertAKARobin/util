// import './dummydom.ts';
import { suite, test } from '../spec/index.ts';

import { setAttributes, setStyle } from './attributes.ts';

export const spec = suite(import.meta.url,
	{
		args: () => ({
			subject: document.createElement(`div`),
		}),
	},

	test(`setAttributes`, $ => {
		const { subject } = $.args;
		$.assert(x => x(subject.className) === ``);
		$.assert(x => x(subject.getAttribute(`title`)) === null);

		$.log(() => setAttributes(subject, { class: `foo`, title: `bar` }));
		$.assert(x => x(subject.className) === `foo`);
		$.assert(x => x(subject.getAttribute(`title`)) === `bar`);

		$.log(() => setAttributes(subject, { title: `newtitle` }));
		$.assert(x => x(subject.className) === `foo`);
		$.assert(x => x(subject.getAttribute(`title`)) === `newtitle`);
	}),

	test(`style`, $ => {
		const { subject } = $.args;
		$.assert(x => x(subject.style.color) === ``);
		$.assert(x => x(subject.style.getPropertyValue(`color`)) === ``);
		$.assert(x => x(subject.style.width) === ``);

		$.log(() => setStyle(subject, { color: `red`, width: `100px` }));
		$.assert(x => x(subject.style.color) === `red`);
		$.assert(x => x(subject.style.getPropertyValue(`color`)) === `red`);
		$.assert(x => x(subject.style.getPropertyValue(`width`)) === `100px`);

		$.log(() => setStyle(subject, { color: `blue` }));
		$.assert(x => x(subject.style.color) === `blue`);
		$.assert(x => x(subject.style.getPropertyValue(`color`)) === `blue`);

		$.log(() => setStyle(subject, { borderWidth: `2px` }));
		$.assert(x => x(subject.style.borderWidth) === `2px`);
		$.assert(x => x(subject.style.getPropertyValue(`border-width`)) === `2px`);
	}),
);
