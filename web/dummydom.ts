import { JSDOM } from 'jsdom';

export class DummyDOM {
	window!: Window;

	constructor() {
		this.refresh();
	}

	refresh() {
		const dummyDOM = new JSDOM().window;
		const properties = Object.getOwnPropertyNames(dummyDOM);
		globalThis.customElements = dummyDOM.customElements;
		globalThis.document = dummyDOM.document;
		globalThis.NodeFilter = dummyDOM.NodeFilter;
		globalThis.requestAnimationFrame = () => 0;
		for (const propertyName of properties) {
			if (propertyName.startsWith(`HTML`)) {
				const value = dummyDOM[propertyName]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
				Object.assign(globalThis, {
					[propertyName]: value, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
				});
			}
		}
		globalThis.requestAnimationFrame = () => 0;
		return dummyDOM;
	}
}
