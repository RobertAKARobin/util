import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

const initial = {
	listItems: [
		{
			uid: `test`,
			value: `Hello world`,
		},
	],
};

export const state = new Emitter({
	initial,
});
