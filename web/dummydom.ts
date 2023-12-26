import { JSDOM } from 'jsdom';

export class DummyDOM {
	window!: Window;

	constructor() {
		this.refresh();
	}

	refresh() {
		const dummyDOM = new JSDOM().window;

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
