import { test } from '../spec/index.ts';

import { PathNavigator } from './pathNavigator.ts';

export const spec = test(`PathNavigator`, $ => {
	const pathData = `M5,5h45s-20,25,0,45,45,0,45,0v20C50,115,5,80,5,80Z`;

	const expected = `
5,5 50,5
50,5 50,5 30,30 50,50
50,50 70,70 95,50 95,50
95,50 95,70
95,70 50,115 5,80 5,80
5,80 5,5`.trim();

	const result = PathNavigator.fromData(pathData);
	$.assert(x => x(expected) === x(result.toString()));
});
