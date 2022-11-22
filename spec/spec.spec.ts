import * as $ from '.';

$.test(`Math`, $ => {
	let x = 3;
	let y = 4;
	$.assert($ => $(typeof x) === `number`);

	$.testx(`addition`, $ => {
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

	$.test(`division`, $ => {
		$.assert($ => $(x) === $(12 / y));
		$.assert(() => $.thrown(() => {throw new Error(`oh no`); }) instanceof Error);
	});

	$.test(`multiplication`, $ => {
		$.assert($ => $(x * 4) !== $(y));
		$.assert($ => $(x * -1) === $(y));
		$.assert($ => $(x * 4) === $(y * 3));
	});
});

$.testx(`Text`);

export const expected = `
1.	🔴 Math
	1.0	🟢 (typeof x) === \`number\`
	1.1	⚪ addition
		1.1.0	⚪ (x + 1) === (y)
	1.2	🟡 subtraction
		1.2.0 🟢 (y - 1) === (x)
		1.2.1 🟡 (x)
			Does not return a boolean
	1.3	🟡 division
		1.3.0	🟢 (x) === (12 / y)
		1.3.1 🟡 throw new Error(\`oh no\`);
			Uncaught Error: oh no
	1.4	🔴 multiplication
		1.4.0	🟢 (x * 4) !== (y)
		1.4.1	🔴 (x * -1) === (y)
			(-3) === (4)
		1.4.2	🟢 (x * 4) === (y * 3)
2.	⚪ Text

Total Assertions: 8
🟢 Pass: 4
🔴 Fail: 1
🟡 Error: 2
⚪ Skip: 1
`;
