import $ from '.';

$.suite(`Math`, $ => {
	let x: number;
	let y: number;

	$.beforeEach = async() => {
		await new Promise((resolve) => {
			x = 3;
			y = 4;
			setTimeout(resolve, 10);
		});
	};

	$.test(`types`, $ => {
		$.assert($ => $(typeof x) === `number`);
	});

	$.test(`addition`, $ => {
		$.assert($ => $(x + 1) === $(y));
	});

	$.test(`subtraction`, async $ => {
		x = await new Promise((resolve) => {
			setTimeout(() => resolve(4), 10);
		});
		y = await new Promise((resolve) => {
			setTimeout(() => resolve(3), 10);
		});
		$.assert($ => $(x - 1) === $(y));
		$.assert($ => $(x) as unknown as boolean);
	});

	$.suite(`division`, $ => {
		$.test(``, $ => {
			$.assert($ => $(x) === $(12 / y));
			// $.assert(() => {throw new Error(`oh no`); });
			const throwMe = () => {throw new Error(`oh no`); };
			$.assert($ => $.thrownBy(throwMe) instanceof $(Error));
		});

		$.test(`by zero`, $ => {
			$.assert($ => $(3 / 0) === $(Infinity));
		});
	});

	$.test(`multiplication`, $ => {
		$.assert($ => $(x * 4) !== $(y));
		$.assert($ => $(x * -1) === $(y));
		$.assert($ => $(x * 4) === $(y * 3));
	});
});

export const expected = `
🔴 1. Math
	🟢 1.1. types
		🟢 1.1.1. (typeof x) === \`number\`
	🟢 1.2. addition
		🟢 1.2.1. (x + 1) === (y)
	🟡 1.3. subtraction
		🟢 1.3.2. (y - 1) === (x)
		🟡 1.3.2. (x)
			Does not return a boolean
	🟡 1.4. division
		🟡 1.4.1.
			🟢 1.4.1.1. (x) === (12 / y)
			🟡 1.4.1.2. throw new Error(\`oh no\`);
				Uncaught Error: oh no
			🟢 1.4.1.3. thrownBy(throwMe) instanceof (Error)
		🟢 1.4.2. by zero
			🟢 1.4.2.1. (3 / 0) === (Infinity)
	🔴 1.5. multiplication
		🟢 1.5.1. (x * 4) !== (y)
		🔴 1.5.2. (x * -1) === (y)
			(-3) === (4)
		🟢 1.5.3. (x * 4) === (y * 3)

Total Assertions: 8
🟢 Pass: 4
🔴 Fail: 1
🟡 Error: 2
⚪ Pending: 0
`;

// const specRunner = new SpecRunner();
// specRunner.test(`SpecRunner`, async specRunner => {
// 	await specRunner.run();

// 	specRunner.assert($ => $(specRunner.log()) === $(expected));
// });
