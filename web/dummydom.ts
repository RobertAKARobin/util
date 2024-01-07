import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole(); // Suppresses CSS errors caused by JSDOM not recognizing some of the latest CSS features, like & for nesting https://stackoverflow.com/a/64319057/2053389

export class DummyDOM {
	window!: Window;

	constructor() {
		this.refresh();
	}

	refresh() {
		const dummyDOM = new JSDOM(``, { virtualConsole }).window;

		globalThis.customElements = dummyDOM.customElements;
		globalThis.document = dummyDOM.document;
		globalThis.NodeFilter = dummyDOM.NodeFilter;
		globalThis.requestAnimationFrame = () => 0;

		const properties = Object.getOwnPropertyNames(dummyDOM);
		for (const propertyName of properties) {
			if (propertyName.startsWith(`HTML`)) { // Making all the HTML elements globally available
				const value = dummyDOM[propertyName]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
				Object.assign(globalThis, {
					[propertyName]: value, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
				});
			}
		}

		return dummyDOM;
	}
}

export const dummyDOM = new DummyDOM();
