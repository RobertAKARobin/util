import { test } from './spec/index.js';

import { mixin } from './mixin.js';

class GrandparentMixin {
	static staticProperty
		= `static property grandparent`;
	static staticProperty_grandparent
		= `static property grandparent`;
	static staticMethodArrow
		= () => `static method arrow grandparent`;
	static staticMethodArrow_grandparent
		= () => `static method arrow grandparent`;
	static staticMethodTraditional() {
		return `static method traditional grandparent`;
	}
	static staticMethodTraditional_grandparent() {
		return `static method traditional grandparent`;
	}

	instanceProperty
		= `instance property grandparent`;
	instanceProperty_grandparent
		= `instance property grandparent`;
	instanceMethodArrow
		= () => `instance method arrow grandparent`;
	instanceMethodArrow_grandparent
		= () => `instance method arrow grandparent`;
	instanceMethodTraditional() {
		return `instance method traditional grandparent`;
	}
	instanceMethodTraditional_grandparent() {
		return `instance method traditional grandparent`;
	}
}

class ParentMixin {
	static staticProperty
		= `static property parent`;
	static staticProperty_parent
		= `static property parent`;
	static staticMethodArrow
		= () => `static method arrow parent`;
	static staticMethodArrow_parent
		= () => `static method arrow parent`;
	static staticMethodTraditional() {
		return `static method traditional parent`;
	}
	static staticMethodTraditional_parent() {
		return `static method traditional parent`;
	}

	instanceProperty
		= `instance property parent`;
	instanceProperty_parent
		= `instance property parent`;
	instanceMethodArrow
		= () => `instance method arrow parent`;
	instanceMethodArrow_parent
		= () => `instance method arrow parent`;
	instanceMethodTraditional() {
		return `instance method traditional parent`;
	}
	instanceMethodTraditional_parent() {
		return `instance method traditional parent`;
	}
}
class ChildMixin {
	static staticProperty = `static property child`;
	static staticMethodArrow = () => `static method arrow child`;
	static staticMethodTraditional() {
		return `static method traditional child`;
	}

	instanceProperty = `instance property child`;
	instanceMethodArrow = () => `instance method arrow child`;
	instanceMethodTraditional() {
		return `instance method traditional child`;
	}
}

const ChildClass = mixin(
	mixin(ChildMixin, ParentMixin),
	GrandparentMixin,
);

export const spec = test(import.meta.url, $ => {
	const child = new ChildClass();
	$.assert(x => x(ChildClass.staticProperty) === `static property parent`);
	$.assert(x => x(ChildClass.staticProperty_parent) === `static property parent`);
	$.assert(x => x(ChildClass.staticProperty_grandparent) === `static property grandparent`);

	$.assert(x => x(ChildClass.staticMethodArrow()) === `static method arrow parent`);
	$.assert(x => x(ChildClass.staticMethodArrow_parent()) === `static method arrow parent`);
	$.assert(x => x(ChildClass.staticMethodArrow_grandparent()) === `static method arrow grandparent`);

	$.assert(x => x(ChildClass.staticMethodTraditional()) === `static method traditional parent`);
	$.assert(x => x(ChildClass.staticMethodTraditional_parent()) === `static method traditional parent`);
	$.assert(x => x(ChildClass.staticMethodTraditional_grandparent()) === `static method traditional grandparent`);

	$.assert(x => x(child.instanceProperty) === `instance property child`);
	// TODO1: Finish these
	// $.assert(x => x(child.instanceProperty_parent) === `instance property parent`);
	// $.assert(x => x(child.instanceProperty_grandparent) === `instance property grandparent`);

	$.assert(x => x(child.instanceMethodArrow()) === `instance method arrow child`);
	// $.assert(x => x(child.instanceMethodArrow_parent()) === `instance method arrow parent`);
	// $.assert(x => x(child.instanceMethodArrow_grandparent()) === `instance method arrow grandparent`);

	$.assert(x => x(child.instanceMethodTraditional()) === `instance method traditional parent`);
	// $.assert(x => x(child.instanceMethodTraditional_parent()) === `instance method arrow traditional parent`);
	// $.assert(x => x(child.instanceMethodTraditional_grandparent()) === `instance method arrow traditional grandparent`);
});
