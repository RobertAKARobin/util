import { test } from './spec/index.ts';
import { tryCatch } from './tryCatch.ts';

import { mixin } from './mixin.ts';

class Base {
	static baseStaticProperty = `base static property`;
	static baseStaticMethodArrow = () => `base static method arrow`;
	static baseStaticMethodTraditional() {
			return `base static method traditional`;
	}

	baseInstanceProperty = `base instance property`;
	baseInstanceMethodArrow = () => `base instance method arrow`;
	baseInstanceMethodTraditional() {
			return `base instance method traditional`;
	}
}

class Parent {
	static parentStaticProperty = `parent static property`;
	static parentStaticMethodArrow = () => `parent static method arrow`;
	static parentStaticMethodTraditional() {
		return `parent static method traditional`;
	}

	parentInstanceProperty = `parent instance property`;
	parentInstanceMethodArrow = () => `parent instance method arrow`;
	parentInstanceMethodTraditional() {
		return `parent instance method traditional`;
	}
}

interface Child extends Parent, Base {}
class Child {}
mixin(Child, Parent, Base);

export const spec = test(`mixin`, $ => {
	const child = new Child();
	$.assert(x => x(`baseStaticProperty` in Child)); // Although this passes, Typescript doesn't "know" about `baseStaticProperty`. See https://stackoverflow.com/a/70441097/2053389
	$.assert(x => x(child.baseInstanceProperty) === undefined);
	$.assert(x => x(child.baseInstanceMethodArrow) === undefined);
	$.assert(x => x(child.baseInstanceMethodTraditional()) === `base instance method traditional`);
});
