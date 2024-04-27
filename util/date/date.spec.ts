import { suite } from '../spec/index.ts';

export const spec = suite(`date/`, {},
	(await import(`./ampmToDate.spec.ts`)).spec,
	(await import(`./dateFormat.spec.ts`)).spec,
	(await import(`./dayEnd.spec.ts`)).spec,
);
