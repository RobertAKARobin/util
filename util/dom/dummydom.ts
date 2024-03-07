import { JSDOM, VirtualConsole } from 'jsdom'; // npm i jsdom @types/jsdom

export class DummyDOM {
	window!: Window;

	constructor() {
		this.refresh();
	}

	refresh(options: Partial<{
		force: boolean;
	}> = {}) {
		const force = options.force ?? false;

		if (`document` in globalThis && !force) {
			return;
		}

		const virtualConsole = new VirtualConsole(); // Suppresses CSS errors caused by JSDOM not recognizing some of the latest CSS features, like & for nesting https://stackoverflow.com/a/64319057/2053389

		const dummyDOM = new JSDOM(``, { virtualConsole }).window;

		globalThis.AbortController = dummyDOM.AbortController;
		globalThis.Comment = dummyDOM.Comment; // TODO2: Add these automatically instead of piecemeal?
		globalThis.customElements = dummyDOM.customElements;
		globalThis.document = dummyDOM.document;
		globalThis.DOMParser = dummyDOM.DOMParser;
		globalThis.location = dummyDOM.location;
		globalThis.history = dummyDOM.history;
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
