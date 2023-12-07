import { test } from './spec/index.ts';

import { Emitter } from './emitter.ts';

export const spec = test(`Emitter`, $ => {
	const emitter1 = new Emitter<{ age: number; }>();
	const emitter2 = new Emitter<{ age: number; }>();

	let emitter1_subscription1_value: number;
	let emitter1_subscription2_value: number;
	let emitter2_subscription1_value: number;

	$.assert(x => x(emitter1.subscriptions.size) === 0);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 0);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	$.log(() => emitter1.subscribe(({ age }) => emitter1_subscription1_value = age));
	$.assert(x => x(emitter1.subscriptions.size) === 1);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 0);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	$.log(() => emitter1.subscribe(({ age }) => emitter1_subscription2_value = age));
	$.assert(x => x(emitter1.subscriptions.size) === 2);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 0);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	$.log(() => emitter2.subscribe(({ age }) => emitter2_subscription1_value = age));
	$.assert(x => x(emitter1.subscriptions.size) === 2);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 1);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	let emitter1_value1: number;
	$.log(() => emitter1_value1 = 42);
	$.log(() => emitter1.set({ age: emitter1_value1 }));
	$.assert(x => x(emitter1.cache.list[0].update.age) === emitter1_value1);
	$.assert(x => x(emitter1_subscription1_value) === emitter1_value1);
	$.assert(x => x(emitter1_subscription2_value) === emitter1_value1);

	let emitter1_value2: number;
	$.log(() => emitter1_value2 = 43);
	$.log(() => emitter1.set({ age: emitter1_value2 }));
	$.assert(x => x(emitter1.cache.list[0].update.age) === emitter1_value2);
	$.assert(x => x(emitter1_subscription1_value) === emitter1_value2);
	$.assert(x => x(emitter1_subscription2_value) === emitter1_value2);

	let emitter2_value1: number;
	$.log(() => emitter2_value1 = 3);
	$.log(() => emitter2.set({ age: emitter2_value1 }));
	$.assert(x => x(emitter2.cache.list[0].update.age) === emitter2_value1);
	$.assert(x => x(emitter1_subscription1_value) === emitter1_value2);
	$.assert(x => x(emitter1_subscription2_value) === emitter1_value2);
	$.assert(x => x(emitter2_subscription1_value) === emitter2_value1);

	let emitterCache0: Emitter<{ age: number; }>;
	let emitterCache1: Emitter<{ age: number; }>;
	let emitterCache2: Emitter<{ age: number; }>;
	$.log(() => emitterCache0 = new Emitter({ age: 0 }, {}, { limit: 0 }));
	$.log(() => emitterCache1 = new Emitter({ age: 0 }));
	$.log(() => emitterCache2 = new Emitter({ age: 0 }, {}, { limit: 2 }));
	$.assert(x => x(JSON.stringify(emitterCache0.cache.list)) === `[]`);
	$.assert(x => x(JSON.stringify(emitterCache1.cache.list)) === `[]`);
	$.assert(x => x(JSON.stringify(emitterCache2.cache.list)) === `[]`);
	$.log(() => emitterCache0.set({ age: 42 }));
	$.log(() => emitterCache1.set({ age: 42 }));
	$.log(() => emitterCache2.set({ age: 42 }));
	$.assert(x => x(JSON.stringify(emitterCache0.cache.list)) === `[]`);
	$.assert(x => x(JSON.stringify(emitterCache1.cache.list)) === `[{"update":{"age":42}}]`);
	$.assert(x => x(JSON.stringify(emitterCache2.cache.list)) === `[{"update":{"age":42}}]`);
	$.log(() => emitterCache0.set({ age: 43 }));
	$.log(() => emitterCache1.set({ age: 43 }));
	$.log(() => emitterCache2.set({ age: 43 }));
	$.assert(x => x(JSON.stringify(emitterCache0.cache.list)) === `[]`);
	$.assert(x => x(JSON.stringify(emitterCache1.cache.list)) === `[{"update":{"age":43}}]`);
	$.assert(x => x(JSON.stringify(emitterCache2.cache.list)) === `[{"update":{"age":43}},{"update":{"age":42}}]`);
	$.log(() => emitterCache0.set({ age: 44 }));
	$.log(() => emitterCache1.set({ age: 44 }));
	$.log(() => emitterCache2.set({ age: 44 }));
	$.assert(x => x(JSON.stringify(emitterCache0.cache.list)) === `[]`);
	$.assert(x => x(JSON.stringify(emitterCache1.cache.list)) === `[{"update":{"age":44}}]`);
	$.assert(x => x(JSON.stringify(emitterCache2.cache.list)) === `[{"update":{"age":44}},{"update":{"age":43}}]`);

	$.log(`cache.list always returns new array:`);
	$.assert(x => x(emitterCache2.cache.list) !== x(emitterCache2.cache.list));

	let emitter1Pipe: Emitter<{ age: number; }>;
	$.log(() => emitter1Pipe = emitter1.pipe(({ age }) => ({ age: age * 100 })));
	$.log(() => emitter1.set({ age: 3 }));
	$.assert(x => x(emitter1Pipe.value.age) === 300);
	$.log(() => emitter1.set({ age: 4 }));
	$.assert(x => x(emitter1Pipe.value.age) === 400);

	const initial = { foo: `bar` };
	let emitterWithInitial: Emitter<typeof initial>;
	$.log(() => emitterWithInitial = new Emitter(initial));
	$.assert(x => x(emitterWithInitial.value) === initial);
});
