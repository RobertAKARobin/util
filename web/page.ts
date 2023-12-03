import { appContext } from '@robertakarobin/jsutil/context.ts';

import { type BoundElement, Component, globals } from './component.ts';

export abstract class Page<State = object>
	extends Component<{ title: string; } & State> {
	constructor(input: { title?: string; } & State) {
		super({
			...input,
			title: input.title ?? ``,
		});
		if (appContext === `browser`) {
			document.title = this.last.title!;
		}
	}

	hydrate($root: Element) {
		const unhydratedInstances = globals[Component.unhydratedInstancesName];
		unhydratedInstances.clear();

		const unhydratedArgs = globals[Component.unhydratedDataName];

		const hydratedInstances = new Map<Component[`id`], Component>();

		const $firstOfThisType = $root.querySelector(`[${Component.$elAttrType}=${this.Ctor.name}]`);
		if ($firstOfThisType) {
			const id = $firstOfThisType.getAttribute(Component.$elAttrId);
			Object.assign(this, { id }); // ID is readonly, but we want to override it here
			hydratedInstances.set(this.id, this);
			this.render();
		}

		const $els = $root.querySelectorAll(`[${Component.$elAttrType}]`);
		for (const $el of Array.from($els) as Array<BoundElement>) {
			const id = $el.getAttribute(Component.$elAttrId)!;

			let instance = hydratedInstances.get(id);
			if (instance === undefined) {
				const constructorName = $el.getAttribute(Component.$elAttrType)!;
				const Constructor = Component.subclasses.get(constructorName)!;
				const args = unhydratedArgs[id];
				instance = new Constructor(args);
				hydratedInstances.set(id, instance);
			}

			instance.setEl($el);
			$el[Component.$elInstance] = instance;
		}

		document.getElementById(Component.unhydratedDataName)?.remove();
		globals[Component.unhydratedDataName] = {};
	}
}
