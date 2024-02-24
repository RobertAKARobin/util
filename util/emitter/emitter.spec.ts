import { suite, test } from '../spec/index.ts';

import { Emitter } from './emitter.ts';

export const spec = suite(`Emitter`, {},
	test(`values`, $ => {
		type State = {
			age: number;
		};
		const emitter1 = new Emitter<State>();
		const emitter2 = new Emitter<State>();

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
		$.assert(x => x(emitter1.cache.list[0].age) === emitter1_value1);
		$.assert(x => x(emitter1_subscription1_value) === emitter1_value1);
		$.assert(x => x(emitter1_subscription2_value) === emitter1_value1);

		let emitter1_value2: number;
		$.log(() => emitter1_value2 = 43);
		$.log(() => emitter1.set({ age: emitter1_value2 }));
		$.assert(x => x(emitter1.cache.list[0].age) === emitter1_value2);
		$.assert(x => x(emitter1_subscription1_value) === emitter1_value2);
		$.assert(x => x(emitter1_subscription2_value) === emitter1_value2);

		let emitter2_value1: number;
		$.log(() => emitter2_value1 = 3);
		$.log(() => emitter2.set({ age: emitter2_value1 }));
		$.assert(x => x(emitter2.cache.list[0].age) === emitter2_value1);
		$.assert(x => x(emitter1_subscription1_value) === emitter1_value2);
		$.assert(x => x(emitter1_subscription2_value) === emitter1_value2);
		$.assert(x => x(emitter2_subscription1_value) === emitter2_value1);


		let emitterCache0: Emitter<{ age: number; }>;
		let emitterCache1: Emitter<{ age: number; }>;
		let emitterCache2: Emitter<{ age: number; }>;

		$.log(() => emitterCache0 = new Emitter<State>(null, { limit: 0 }));
		$.log(() => emitterCache1 = new Emitter<State>());
		$.log(() => emitterCache2 = new Emitter<State>(null, { limit: 2 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list)) === `[]`);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list)) === `[]`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list)) === `[]`);

		$.log(() => emitterCache0 = new Emitter({ age: 0 }, { limit: 0 }));
		$.log(() => emitterCache1 = new Emitter({ age: 0 }));
		$.log(() => emitterCache2 = new Emitter({ age: 0 }, { limit: 2 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":0}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":0}`);
		$.assert(x => x(JSON.stringify(emitterCache2.value)) === `{"age":0}`);


		$.log(() => emitterCache0.set({ age: 42 }));
		$.log(() => emitterCache1.set({ age: 42 }));
		$.log(() => emitterCache2.set({ age: 42 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);

		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":42}`);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[1])) === undefined);

		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":42}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[1])) === `{"age":0}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[2])) === undefined);
		$.assert(x => x(JSON.stringify(emitterCache2.value)) === `{"age":42}`);


		$.log(() => emitterCache0.set({ age: 43 }));
		$.log(() => emitterCache1.set({ age: 43 }));
		$.log(() => emitterCache2.set({ age: 43 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);

		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":43}`);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[1])) === undefined);

		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":43}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[1])) === `{"age":42}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[2])) === undefined);
		$.assert(x => x(JSON.stringify(emitterCache2.value)) === `{"age":43}`);


		$.log(() => emitterCache0.set({ age: 44 }));
		$.log(() => emitterCache1.set({ age: 44 }));
		$.log(() => emitterCache2.set({ age: 44 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":44}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":44}`);

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
	}),

	test(`subscriptions`, $ => {
		type State = number;
		let emitter1!: Emitter<State>;

		$.log(() => emitter1 = new Emitter<State>());
		$.assert(x => x(emitter1.subscriptions.size) === 0);

		let value: State;
		let unsubscribe: ReturnType<Emitter<State>[`subscribe`]>;
		$.log(() => unsubscribe = emitter1.subscribe(update => value = update));
		$.assert(x => x(emitter1.subscriptions.size) === 1);

		$.log(() => emitter1.set(10));
		$.assert(x => x(value) === 10);
		$.log(() => emitter1.set(20));
		$.assert(x => x(value) === 20);

		$.log(() => unsubscribe());
		$.log(() => emitter1.set(30));
		$.assert(x => x(value) === 20);
		$.assert(x => x(emitter1.subscriptions.size) === 0);
	}),

	test(`actions`, $ => {
		type State = {
			age: number;
			name: string;
		};
		class Person extends Emitter<State> {
			age = (years: number) => this.set({
				...this.value,
				age: this.value.age + years,
			});

			rename = (name: string) => this.set({
				...this.value,
				name,
			});
		}
		let person!: Person;
		$.log(() => person = new Person({ age: 10, name: `alice` }));
		let incrementsOnAge = 0;
		let incrementsOnRename = 0;
		$.log(() => person.on(`age`).subscribe(() => incrementsOnAge += 1));
		$.log(() => person.on(`name`).subscribe(() => incrementsOnRename += 1));

		$.log(() => person.age(1));
		$.assert(x => x(person.value.age) === 11);
		$.assert(x => x(incrementsOnAge) === 1);
		$.assert(x => x(person.value.name) === `alice`);
		$.assert(x => x(incrementsOnRename) === 0);

		$.log(() => person.rename(`bob`));
		$.assert(x => x(incrementsOnAge) === 1);
		$.assert(x => x(incrementsOnRename) === 1);
		$.assert(x => x(person.value.name) === `bob`);
		$.assert(x => x(incrementsOnRename) === 1);

		let incrementsWhenOlder = 0;
		const isOlder = (updated: State, previous: State) => updated.age > previous.age;
		$.log(() => person.filter(isOlder).subscribe(() => incrementsWhenOlder += 1));
		$.log(() => person.age(1));
		$.assert(x => x(incrementsWhenOlder) === 1);
		$.log(() => person.age(0));
		$.assert(x => x(incrementsWhenOlder) === 1);
		$.log(() => person.age(-1));
		$.assert(x => x(incrementsWhenOlder) === 1);
		$.log(() => person.age(1));
		$.assert(x => x(incrementsWhenOlder) === 2);
	}),

	test(`reset`, $ => {
		const reset = () => ({
			age: undefined as number | undefined,
			name: ``,
		});
		const emitter = new Emitter(reset(), { reset });

		$.assert(x => x(emitter.$.name) === ``);
		$.log(() => emitter.patch({ name: `steve` }));
		$.assert(x => x(emitter.$.name) === `steve`);
		$.log(() => emitter.reset());
		$.assert(x => x(emitter.$.name) === ``);
	}),

	test(`formatter`, $ => {
		const reset = () => ({
			name: ``,
		});
		const emitter = new Emitter(reset(), {
			format: update => ({
				...update,
				name: update.name.toUpperCase(),
			}),
			reset,
		});

		$.log(() => emitter.patch({ name: `steve` }));
		$.assert(x => x(emitter.$.name) === `STEVE`);
	}),
);