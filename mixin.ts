export function mixin<
	TargetType,
	TargetConstructor extends { new(...args: any): TargetType }
>(Target: TargetConstructor, ...Sources: Array<Function>) {
	for (const Source of Sources) {
		const staticProperties = Object.getOwnPropertyDescriptors(Source);
		for (const staticPropertyName in staticProperties) { // Note that while this does copy over static properties, Typescript won't recognize them: https://stackoverflow.com/a/70441097/2053389
			if ([`prototype`, `length`, `name`].includes(staticPropertyName)) {
				continue;
			}
			const staticProperty = staticProperties[staticPropertyName];
			Object.defineProperty(Target, staticPropertyName, staticProperty);
		}

		const instanceProperties = Object.getOwnPropertyDescriptors(Source.prototype);
		for (const instancePropertyName in instanceProperties) { // Note that this includes _prototype_ properties, but not _instance_ properties: https://stackoverflow.com/q/77733619/2053389
			if ([`constructor`].includes(instancePropertyName)) {
				continue;
			}
			const instanceProperty = instanceProperties[instancePropertyName];
			Object.defineProperty(Target.prototype, instancePropertyName, instanceProperty);
		}
	}
	return Target;
}
