/* eslint-disable @typescript-eslint/no-misused-promises */
import * as test from 'node:test'; // TODO3: Replace with util/spec?
import path from 'path';

import { RuleTester } from '@typescript-eslint/rule-tester';

import localPlugin from './rules/index.js';

// This is required, which is dumb. See https://typescript-eslint.io/packages/rule-tester/#nodejs-nodetest
RuleTester.afterAll = test.after;
RuleTester.describe = test.describe;
RuleTester.it = test.it;
RuleTester.itOnly = test.it.only;

for (const ruleName in localPlugin.rules) {
	console.log(`>>> test rule ${ruleName}`);
	void import(path.join(import.meta.dirname, `rules`, `${ruleName}.test.js`));
}
