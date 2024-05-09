import '../dom/dummydom.ts';

import { suite, test } from '../spec/index.ts';
import { sleep } from '../time/sleep.ts';

import { type EmitEvent, Emitter, type Subscription } from './emitter.ts';
import { pipeFilter } from './pipe/filter.ts';
import { pipeFirst } from './pipe/first.ts';
import { pipeOn } from './pipe/on.ts';
import { pipeUntil } from './pipe/until.ts';

type State = {
	age: number;
};

export const spec = suite(import.meta.url, {},
	test(`values`, $ => {
		const emitter1 = new Emitter<State>();
		const emitter2 = new Emitter<State>();

		let emitter1_subscription1_value: number;
		let emitter1_subscription2_value: number;
		let emitter2_subscription1_value: number;

		$.assert(x => x(emitter1.handlers.size) === 0);
		$.assert(x => x(emitter1.cache.list[0]) === void 0);
		$.assert(x => x(emitter1.cache.count) === 0);
		$.assert(x => x(emitter2.handlers.size) === 0);
		$.assert(x => x(emitter2.cache.list[0]) === void 0);
		$.assert(x => x(emitter2.cache.count) === 0);

		$.log(() => emitter1.subscribe(({ age }) => emitter1_subscription1_value = age));
		$.assert(x => x(emitter1.handlers.size) === 1);
		$.assert(x => x(emitter1.cache.count) === 0);
		$.assert(x => x(emitter1.cache.list[0]) === void 0);
		$.assert(x => x(emitter2.handlers.size) === 0);
		$.assert(x => x(emitter2.cache.count) === 0);
		$.assert(x => x(emitter2.cache.list[0]) === void 0);

		$.log(() => emitter1.subscribe(({ age }) => emitter1_subscription2_value = age));
		$.assert(x => x(emitter1.handlers.size) === 2);
		$.assert(x => x(emitter1.cache.list[0]) === void 0);
		$.assert(x => x(emitter2.handlers.size) === 0);
		$.assert(x => x(emitter2.cache.list[0]) === void 0);

		$.log(() => emitter2.subscribe(({ age }) => emitter2_subscription1_value = age));
		$.assert(x => x(emitter1.handlers.size) === 2);
		$.assert(x => x(emitter1.cache.list[0]) === void 0);
		$.assert(x => x(emitter2.handlers.size) === 1);
		$.assert(x => x(emitter2.cache.list[0]) === void 0);

		let emitter1_value1: number;
		$.log(() => emitter1_value1 = 42);
		$.log(() => emitter1.set({ age: emitter1_value1 }));
		$.assert(x => x(emitter1.cache.count) === 1);
		$.assert(x => x(emitter1.cache.list[0].age) === emitter1_value1);
		$.assert(x => x(emitter1_subscription1_value) === emitter1_value1);
		$.assert(x => x(emitter1_subscription2_value) === emitter1_value1);

		let emitter1_value2: number;
		$.log(() => emitter1_value2 = 43);
		$.log(() => emitter1.set({ age: emitter1_value2 }));
		$.assert(x => x(emitter1.cache.count) === 2);
		$.assert(x => x(emitter1.cache.list[0].age) === emitter1_value2);
		$.assert(x => x(emitter1_subscription1_value) === emitter1_value2);
		$.assert(x => x(emitter1_subscription2_value) === emitter1_value2);

		let emitter2_value1: number;
		$.log(() => emitter2_value1 = 3);
		$.log(() => emitter2.set({ age: emitter2_value1 }));
		$.assert(x => x(emitter2.cache.count) === 1);
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
		$.assert(x => x(emitterCache0.cache.count) === 0);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list)) === `[]`);
		$.assert(x => x(emitterCache1.cache.count) === 0);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list)) === `[]`);
		$.assert(x => x(emitterCache2.cache.count) === 0);

		$.log(() => emitterCache0 = new Emitter({ age: 0 }, { limit: 0 }));
		$.log(() => emitterCache1 = new Emitter({ age: 0 }));
		$.log(() => emitterCache2 = new Emitter({ age: 0 }, { limit: 2 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);
		$.assert(x => x(emitterCache0.cache.count) === 1);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":0}`);
		$.assert(x => x(emitterCache1.cache.count) === 1);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":0}`);
		$.assert(x => x(JSON.stringify(emitterCache2.value)) === `{"age":0}`);
		$.assert(x => x(emitterCache2.cache.count) === 1);


		$.log(() => emitterCache0.set({ age: 42 }));
		$.log(() => emitterCache1.set({ age: 42 }));
		$.log(() => emitterCache2.set({ age: 42 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);
		$.assert(x => x(emitterCache0.cache.count) === 2);

		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":42}`);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[1])) === undefined);
		$.assert(x => x(emitterCache1.cache.count) === 2);

		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":42}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[1])) === `{"age":0}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[2])) === undefined);
		$.assert(x => x(JSON.stringify(emitterCache2.value)) === `{"age":42}`);
		$.assert(x => x(emitterCache1.cache.count) === 2);


		$.log(() => emitterCache0.set({ age: 43 }));
		$.log(() => emitterCache1.set({ age: 43 }));
		$.log(() => emitterCache2.set({ age: 43 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);
		$.assert(x => x(emitterCache0.cache.count) === 3);

		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":43}`);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[1])) === undefined);
		$.assert(x => x(emitterCache1.cache.count) === 3);

		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":43}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[1])) === `{"age":42}`);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[2])) === undefined);
		$.assert(x => x(JSON.stringify(emitterCache2.value)) === `{"age":43}`);
		$.assert(x => x(emitterCache2.cache.count) === 3);


		$.log(() => emitterCache0.set({ age: 44 }));
		$.log(() => emitterCache1.set({ age: 44 }));
		$.log(() => emitterCache2.set({ age: 44 }));
		$.assert(x => x(JSON.stringify(emitterCache0.cache.list[0])) === undefined);
		$.assert(x => x(emitterCache0.cache.count) === 4);
		$.assert(x => x(JSON.stringify(emitterCache1.cache.list[0])) === `{"age":44}`);
		$.assert(x => x(emitterCache1.cache.count) === 4);
		$.assert(x => x(JSON.stringify(emitterCache2.cache.list[0])) === `{"age":44}`);
		$.assert(x => x(emitterCache2.cache.count) === 4);

		$.log(`cache.list always returns new array:`);
		$.assert(x => x(emitterCache2.cache.list) !== x(emitterCache2.cache.list));

		const initial = { foo: `bar` };
		let emitterWithInitial: Emitter<typeof initial>;
		$.log(() => emitterWithInitial = new Emitter(initial));
		$.assert(x => x(emitterWithInitial.value) === initial);
	}),

	test(`pipe`, $ => {
		const emitter1 = new Emitter<State>();
		let emitter1Pipe: Emitter<{ age: number; }>;
		$.log(() => emitter1Pipe = emitter1.pipe(({ age }) => ({ age: age * 100 })));
		$.log(() => emitter1.set({ age: 3 }));
		$.assert(x => x(emitter1Pipe.value.age) === 300);
		$.log(() => emitter1.set({ age: 4 }));
		$.assert(x => x(emitter1Pipe.value.age) === 400);
	}),

	test(`subscriptions`, $ => {
		type State = number;
		let emitter1!: Emitter<State>;

		$.log(() => emitter1 = new Emitter<State>());
		$.assert(x => x(emitter1.handlers.size) === 0);

		let value: State;
		let subscription: Subscription<State>;
		$.log(() => subscription = emitter1.subscribe(update => value = update));
		$.assert(x => x(emitter1.handlers.size) === 1);

		$.log(() => emitter1.set(10));
		$.assert(x => x(value) === 10);
		$.log(() => emitter1.set(20));
		$.assert(x => x(value) === 20);

		$.log(() => subscription.unsubscribe());
		$.log(() => emitter1.set(30));
		$.assert(x => x(value) === 20);
		$.assert(x => x(emitter1.handlers.size) === 0);
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
		$.log(() => person.pipe(pipeOn(`age`)).subscribe(() => incrementsOnAge += 1));
		$.log(() => person.pipe(pipeOn(`name`)).subscribe(() => incrementsOnRename += 1));

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
		const isOlder = (
			...[updated, { previous }]: EmitEvent<State>
		) => updated.age > previous.age;
		$.log(() => person.pipe(pipeFilter(isOlder)).subscribe(() => incrementsWhenOlder += 1));
		$.log(() => person.age(1));
		$.assert(x => x(incrementsWhenOlder) === 1);
		$.log(() => person.age(0));
		$.assert(x => x(incrementsWhenOlder) === 1);
		$.log(() => person.age(-1));
		$.assert(x => x(incrementsWhenOlder) === 1);
		$.log(() => person.age(1));
		$.assert(x => x(incrementsWhenOlder) === 2);
	}),

	test(`reducer`, $ => {
		const reset = () => ({
			name: ``,
		});
		const emitter = new Emitter(reset(), {
			reduce: ({ name }) => ({
				name: name.toUpperCase(),
			}),
			reset,
		});

		$.log(() => emitter.patch({ name: `steve` }));
		$.assert(x => x(emitter.$.name) === `STEVE`);
	}),

	test(`fromEvent`, $ => {
		const button = document.createElement(`button`);
		let count = 0;

		const onClick = Emitter.fromEvent(button, `click`);
		const subscription = onClick.subscribe(() => count += 1);

		$.log(() => button.click());
		$.assert(x => x(count) === 1);
		$.log(() => button.click());
		$.assert(x => x(count) === 2);
		$.log(() => subscription.unsubscribe());
		$.log(() => button.click());
		$.assert(x => x(count) === 2);
	}),

	test(`fromPromise`, async $ => {
		const promise = new Promise<boolean>(resolve =>
			setTimeout(() => resolve(true), 100)
		);

		const emitter = Emitter.fromPromise(promise, false);

		$.assert(x => x(emitter.value) === false);
		await promise;
		$.assert(x => x(emitter.value) === true);
	}),

	test(`toPromise`, async $ => {
		const emitter = new Emitter(`a`);

		let promise = emitter.toPromise();
		setTimeout(() => emitter.set(`b`), 10);
		$.assert(x => x(emitter.value) === `a`);
		await $.assert(async x => x(await promise) === `b`);
		$.assert(x => x(emitter.value) === `b`);

		promise = emitter.toPromise();
		setTimeout(() => emitter.set(`c`), 10);
		$.assert(x => x(emitter.value) === `b`);
		await $.assert(async x => x(await promise) === `c`);
		$.assert(x => x(emitter.value) === `c`);

		promise = emitter.toPromise({ resolveIfHasValue: true });
		setTimeout(() => emitter.set(`d`), 20);
		$.assert(x => x(emitter.value) === `c`);
		await $.assert(async x => x(await promise) === `c`);
		$.assert(x => x(emitter.value) === `c`);
		await sleep(20);
		$.assert(x => x(emitter.value) === `d`);
	}),

	suite(`pipes`, {},
		test(`on`, $ => {
			const initial = {
				age: 3,
				name: `steve`,
			};
			const emitter = new Emitter<typeof initial>();

			let value: typeof emitter.value;
			let valuePiped: typeof emitter.value;
			emitter.subscribe(update => value = update);
			emitter.pipe(pipeOn(`name`)).subscribe(update => valuePiped = update);

			$.log(() => emitter.set(initial));
			$.assert(x => x(value.age) === x(initial.age));
			$.assert(x => x(valuePiped.age) === x(initial.age));
			$.assert(x => x(value.name) === x(initial.name));
			$.assert(x => x(valuePiped.name) === x(initial.name));

			const age = initial.age + 1;
			$.log(() => emitter.patch({ age }));
			$.assert(x => x(value.age) === x(age));
			$.assert(x => x(valuePiped.age) === x(initial.age));
			$.assert(x => x(value.name) === x(initial.name));
			$.assert(x => x(valuePiped.name) === x(initial.name));

			const name = initial.name + `o`;
			$.log(() => emitter.patch({ name }));
			$.assert(x => x(value.age) === x(age));
			$.assert(x => x(valuePiped.age) === x(age));
			$.assert(x => x(value.name) === x(name));
			$.assert(x => x(valuePiped.name) === x(name));
		}),

		test(`first`, $ => {
			const initial = 0;
			const emitter = new Emitter(initial);
			const piped = emitter.pipe(pipeFirst(2));

			$.log(() => emitter.set(initial + 1));
			$.assert(x => x(piped.value) === 1);

			$.log(() => emitter.set(initial + 2));
			$.assert(x => x(piped.value) === 2);

			$.log(() => emitter.set(initial + 3));
			$.assert(x => x(piped.value) === 2);

			$.log(() => emitter.set(initial + 4));
			$.assert(x => x(piped.value) === 2);

			$.assert(x => x(emitter.handlers.size) === 0);
			$.assert(x => x(piped.handlers.size) === 0);
		}),

		suite(`until`, {},
			test(`emitter`, $ => {
				const emitter = new Emitter(0);
				const abort = new Emitter<void>();
				const piped = emitter.pipe(pipeUntil(abort));

				$.log(() => emitter.set(1));
				$.assert(x => x(piped.value) === 1);

				$.log(() => emitter.set(2));
				$.assert(x => x(piped.value) === 2);

				$.log(() => abort.set());
				$.log(() => emitter.set(3));
				$.assert(x => x(piped.value) === 2);

				$.assert(x => x(emitter.handlers.size) === 0);
				$.assert(x => x(piped.handlers.size) === 0);
			}),

			test(`condition`, $ => {
				const emitter = new Emitter(0);
				const piped = emitter.pipe(pipeUntil(value => value > 2));

				$.log(() => emitter.set(1));
				$.assert(x => x(piped.value) === 1);

				$.log(() => emitter.set(2));
				$.assert(x => x(piped.value) === 2);

				$.log(() => emitter.set(3));
				$.assert(x => x(piped.value) === 2);

				$.assert(x => x(emitter.handlers.size) === 0);
				$.assert(x => x(piped.handlers.size) === 0);
			}),

			test(`eventTarget`, $ => {
				const emitter = new Emitter(0);
				const button = document.createElement(`button`);
				const piped = emitter.pipe(pipeUntil(button, `click`));

				$.log(() => emitter.set(1));
				$.assert(x => x(piped.value) === 1);

				$.log(() => button.click());
				$.log(() => emitter.set(2));
				$.assert(x => x(piped.value) === 1);

				$.assert(x => x(emitter.handlers.size) === 0);
				$.assert(x => x(piped.handlers.size) === 0);
			}),
		),
	),
);
