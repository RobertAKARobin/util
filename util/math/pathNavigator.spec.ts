import { test } from '../spec/index.ts';

import { PathNavigator } from './pathNavigator.ts';

export const spec = test(`PathNavigator`, $ => {
	const subjects = [
		[
			`M5,5h45s-20,25,0,45,45,0,45,0v20C50,115,5,80,5,80Z`,
			`
5,5 50,5
50,5 50,5 30,30 50,50
50,50 70,70 95,50 95,50
95,50 95,70
95,70 50,115 5,80 5,80
5,80 5,5`,
		],

		[
			`M730,255v305h-460v-295h40c50,0,70-30,110-30s50,15,95,15,55-15,90-15,55,20,85,20h40Z`,
			`
730,255 730,560
730,560 270,560
270,560 270,265
270,265 310,265
310,265 360,265 380,235 420,235
420,235 460,235 470,250 515,250
515,250 560,250 570,235 605,235
605,235 640,235 660,255 690,255
690,255 730,255`,
		],
	];

	for (const [pathData, expectedData] of subjects) {
		const actual = PathNavigator.fromData(pathData).toString().split(`\n`);
		const expected = expectedData.trim().split(`\n`);
		actual.forEach((_nil, index) => {
			$.assert(x => x(expected[index]) === x(actual[index]));
		});
	}
});
