import { delay } from '../../time/delay.js';
import { tryCatch } from '../../tryCatch.js';

import { suite, test } from '../index.js';

function doThrow(/** @type {unknown} */error) {
	throw error;
	return true;
}

export const specs = suite(`Math`,
	{
		args: async() => delay({ x: 3, y: 4 }, 10),
	},

	suite(`types`,
		{
			args: () => ({
				a: Math.round(Math.random() * 10),
			}),
			iterations: 2,
		},

		test(`number`, ({ args, assert }) => {
			assert(x => x(typeof args.a) === `number`);
		}),
	),

	test(`addition`, ({ args, assert, log }) => {
		assert(x => x(args.x + 1) === x(args.y));
		log(`TODO: Add more assertions?`);
	}),

	test(`subtraction`, async({ args, assert, log }) => {
		log(`Delayed by 13 - 27 ms`);
		args.x = log(await delay(14, 10)); // Testing to make sure logs work
		args.y = await log(() => delay(13, 10));
		assert(x => x(args.x - 1) === x(args.y));
	}, {
		iterations: 2,
	}),

	suite(`division`,
		{
			args: args => ({
				...args,
				a: 3,
			}),
		},

		test(`by int`, ({ args, assert }) => {
			assert(x => x(args.x) === x(args.a));
			const xOverY = args.x / args.y; // In Function.toString Node wraps these in parens while the browser doesn't, so just putting them in a variable
			const aOverY = args.a / args.y;
			assert(x => x(xOverY) === x(aOverY));
			const throwMe = () => doThrow(new Error(`This error will be caught.`));
			assert(x => x(tryCatch(throwMe)) instanceof x(Error));
		}),

		test(`by zero`, ({ args, assert }) => {
			const aOver0 = args.a / 0; // See above comment
			assert(x => x(aOver0) === x(Infinity));
		}),
	),

	test(`multiplication`, ({ args, assert }) => {
		assert(x => x(args.x * 4) !== x(args.y));
		assert(x => x(args.x * -1) === x(args.y));
		assert(x => x(args.x * 4) === x(args.y * 3));
	}),
);

export const expected = `
———
  s1 X Math
  s1s1 • types
  s1s1x1 •
  s1s1x1t1 • number
• s1s1x1t1a1 • (typeof args.a) === \`number\`
  s1s1x2 •
  s1s1x2t1 • number
• s1s1x2t1a1 • (typeof args.a) === \`number\`
  s1t2 • addition
• s1t2a1 • (args.x + 1) === (args.y)
  s1t2#  TODO: Add more assertions?
  s1t3 • subtraction
  s1t3x1 •
  s1t3x1#  Delayed by 13 - 27 ms
  s1t3x1#  14
  s1t3x1#  13
• s1t3x1a1 • (args.x - 1) === (args.y)
  s1t3x2 •
  s1t3x2#  Delayed by 13 - 27 ms
  s1t3x2#  14
  s1t3x2#  13
• s1t3x2a1 • (args.x - 1) === (args.y)
  s1s4 • division
  s1s4t1 • by int
• s1s4t1a1 • (args.x) === (args.a)
• s1s4t1a2 • (xOverY) === (aOverY)
• s1s4t1a3 • (tryCatch(throwMe)) instanceof (Error)
  s1s4t2 • by zero
• s1s4t2a1 • (aOver0) === (Infinity)
  s1t5 X multiplication
• s1t5a1 • (args.x * 4) !== (args.y)
X s1t5a2 X (args.x * -1) === (args.y)
           (-3) === (4)
• s1t5a3 • (args.x * 4) === (args.y * 3)
Total completed assertions: 12
   0 deferred
• 11 pass
X  1 fail
RESULT: FAIL
———
`;
