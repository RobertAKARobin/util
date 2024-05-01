import { suite } from '../spec/index.ts';

export const spec = suite(`dom/`,
	{
		timing: `consecutive`,
	},

	(await import(`./listenOnce.spec.ts`)).spec,
	(await import(`./attributes.spec.ts`)).spec,
);
