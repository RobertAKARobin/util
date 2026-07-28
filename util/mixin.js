/**
 * @import { ConstructorOf } from './types.d';
 */

const staticPropertiesToSkip = new Set([`prototype`, `length`, `name`]);
const prototypePropertiesToSkip = new Set([`constructor`]);

/**
 * Copies all static and prototype (but not instance) methods/properties from `Source` to `Target`
 * Note the difference between `prototype` and `instance` properties when defining classes: https://stackoverflow.com/q/77733619/2053389
 * TODO2: Support multiple sources, e.g. ...Source
 * @template Target
 * @template {ConstructorOf<Target>} TargetConstructor
 * @template Source
 * @template {ConstructorOf<Source>} SourceConstructor
 * @param {TargetConstructor} Target
 * @param {SourceConstructor} Source
 * @returns {SourceConstructor & TargetConstructor}
 */
export function mixin(Target, Source) {
	const staticProperties = Object.getOwnPropertyDescriptors(Source);
	for (const staticPropertyName in staticProperties) { // Note that while this does copy over static properties, Typescript won't recognize them: https://stackoverflow.com/a/70441097/2053389
		if (staticPropertiesToSkip.has(staticPropertyName)) {
			continue;
		}

		const staticProperty = staticProperties[staticPropertyName];
		Object.defineProperty(Target, staticPropertyName, staticProperty);
	}

	const prototypeProperties = Object.getOwnPropertyDescriptors(Source.prototype);
	for (const prototypePropertyName in prototypeProperties) {
		if (prototypePropertiesToSkip.has(prototypePropertyName)) {
			continue;
		}

		const prototypeProperty = prototypeProperties[prototypePropertyName];
		Object.defineProperty(Target.prototype, prototypePropertyName, prototypeProperty);
	}

	return /** @type {TargetConstructor & SourceConstructor} */(Target);
}
