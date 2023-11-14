import { test } from '@robertakarobin/spec';

import { Emitter } from './emitter.ts';

export const spec = test(`Emitter`, $ => {
	const emitter1 = new Emitter<number>();
	const emitter2 = new Emitter<number>();

	let emitter1_subscription1_value: number;
	let emitter1_subscription2_value: number;
	let emitter2_subscription1_value: number;

	$.assert(x => x(emitter1.subscriptions.size) === 0);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 0);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	$.log(() => emitter1.subscribe(value => emitter1_subscription1_value = value));
	$.assert(x => x(emitter1.subscriptions.size) === 1);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 0);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	$.log(() => emitter1.subscribe(value => emitter1_subscription2_value = value));
	$.assert(x => x(emitter1.subscriptions.size) === 2);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 0);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	$.log(() => emitter2.subscribe(value => emitter2_subscription1_value = value));
	$.assert(x => x(emitter1.subscriptions.size) === 2);
	$.assert(x => x(emitter1.cache.list[0]) === void 0);
	$.assert(x => x(emitter2.subscriptions.size) === 1);
	$.assert(x => x(emitter2.cache.list[0]) === void 0);

	let emitter1_value1: number;
	$.log(() => emitter1_value1 = 42);
	$.log(() => emitter1.next(emitter1_value1));
	$.assert(x => x(emitter1.cache.list[0]) === emitter1_value1);
	$.assert(x => x(emitter1_subscription1_value) === emitter1_value1);
	$.assert(x => x(emitter1_subscription2_value) === emitter1_value1);

	let emitter1_value2: number;
	$.log(() => emitter1_value2 = 43);
	$.log(() => emitter1.next(emitter1_value2));
	$.assert(x => x(emitter1.cache.list[0]) === emitter1_value2);
	$.assert(x => x(emitter1_subscription1_value) === emitter1_value2);
	$.assert(x => x(emitter1_subscription2_value) === emitter1_value2);

	let emitter2_value1: number;
	$.log(() => emitter2_value1 = 3);
	$.log(() => emitter2.next(emitter2_value1));
	$.assert(x => x(emitter2.cache.list[0]) === emitter2_value1);
	$.assert(x => x(emitter1_subscription1_value) === emitter1_value2);
	$.assert(x => x(emitter1_subscription2_value) === emitter1_value2);
	$.assert(x => x(emitter2_subscription1_value) === emitter2_value1);

	let emitterCache0: Emitter<number>;
	let emitterCache1: Emitter<number>;
	let emitterCache2: Emitter<number>;
	$.log(() => emitterCache0 = new Emitter({ cache: { limit: 0 } }));
	$.log(() => emitterCache1 = new Emitter());
	$.log(() => emitterCache2 = new Emitter({ cache: { limit: 2 } }));
	$.assert(x => x(emitterCache0.cache.list.join(`,`)) === ``);
	$.assert(x => x(emitterCache1.cache.list.join(`,`)) === ``);
	$.assert(x => x(emitterCache2.cache.list.join(`,`)) === ``);
	$.log(() => emitterCache0.next(42));
	$.log(() => emitterCache1.next(42));
	$.log(() => emitterCache2.next(42));
	$.assert(x => x(emitterCache0.cache.list.join(`,`)) === ``);
	$.assert(x => x(emitterCache1.cache.list.join(`,`)) === `42`);
	$.assert(x => x(emitterCache2.cache.list.join(`,`)) === `42`);
	$.log(() => emitterCache0.next(43));
	$.log(() => emitterCache1.next(43));
	$.log(() => emitterCache2.next(43));
	$.assert(x => x(emitterCache0.cache.list.join(`,`)) === ``);
	$.assert(x => x(emitterCache1.cache.list.join(`,`)) === `43`);
	$.assert(x => x(emitterCache2.cache.list.join(`,`)) === `43,42`);
	$.log(() => emitterCache0.next(44));
	$.log(() => emitterCache1.next(44));
	$.log(() => emitterCache2.next(44));
	$.assert(x => x(emitterCache0.cache.list.join(`,`)) === ``);
	$.assert(x => x(emitterCache1.cache.list.join(`,`)) === `44`);
	$.assert(x => x(emitterCache2.cache.list.join(`,`)) === `44,43`);

	$.log(`cache.list always returns new array:`);
	$.assert(x => x(emitterCache2.cache.list) !== x(emitterCache2.cache.list));
});
