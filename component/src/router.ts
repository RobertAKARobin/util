import { Emitter } from 'emit/index.ts';

import { type Component } from 'component/src/component.ts';

export class Router extends Emitter<Component> {
	constructor(
		readonly route: (path: string) => Component
	) {
		super();
	}
}
