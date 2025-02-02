import { test } from './spec/index';

import { mixin } from './mixin';

class Grandparent {
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

class Parent {
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
class Child_ {
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

const Child = mixin(mixin(Child_, Grandparent), Parent);

export const spec = test(import.meta.url, $ => {
	const child = new Child();
	$.assert(x => x(Child.staticProperty) === `static property parent`);
	$.assert(x => x(Child.staticProperty_parent) === `static property parent`);
	$.assert(x => x(Child.staticProperty_grandparent) === `static property grandparent`);

	$.assert(x => x(Child.staticMethodArrow()) === `static method arrow parent`);
	$.assert(x => x(Child.staticMethodArrow_parent()) === `static method arrow parent`);
	$.assert(x => x(Child.staticMethodArrow_grandparent()) === `static method arrow grandparent`);

	$.assert(x => x(Child.staticMethodTraditional()) === `static method traditional parent`);
	$.assert(x => x(Child.staticMethodTraditional_parent()) === `static method traditional parent`);
	$.assert(x => x(Child.staticMethodTraditional_grandparent()) === `static method traditional grandparent`);

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
