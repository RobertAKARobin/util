/**
 * @import { Constructor } from './types.d';
 */

/**
 * Copies all static and prototype methods/properties from `Source` to `Target`
 * Note the difference between `prototype` and `instance` properties when defining classes: https://stackoverflow.com/q/77733619/2053389
 * @template Target
 * @template {Constructor<Target>} TargetConstructor
 * @template Source
 * @template {Constructor<Source>} SourceConstructor
 * @param {TargetConstructor} Target
 * @param {SourceConstructor} Source
 * @returns {SourceConstructor & TargetConstructor}
 */
export function mixin(Target, Source) {
	const staticProperties = Object.getOwnPropertyDescriptors(Source);
	for (const staticPropertyName in staticProperties) { // Note that while this does copy over static properties, Typescript won't recognize them: https://stackoverflow.com/a/70441097/2053389
		if ([`prototype`, `length`, `name`].includes(staticPropertyName)) {
			continue;
		}
		const staticProperty = staticProperties[staticPropertyName];
		Object.defineProperty(Target, staticPropertyName, staticProperty);
	}

	const instanceProperties = Object.getOwnPropertyDescriptors(Source.prototype);
	for (const instancePropertyName in instanceProperties) {
		if ([`constructor`].includes(instancePropertyName)) {
			continue;
		}
		const instanceProperty = instanceProperties[instancePropertyName];
		Object.defineProperty(Target.prototype, instancePropertyName, instanceProperty);
	}

	return /** @type {TargetConstructor & SourceConstructor} */(Target);
}
