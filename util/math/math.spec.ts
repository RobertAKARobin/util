import { suite } from '../spec/index.ts';

export const spec = suite(`math/`, {},
	(await import(`./average.spec.ts`)).spec,
	(await import(`./distance.spec.ts`)).spec,
	(await import(`./slope.spec.ts`)).spec,
	(await import(`./sum.spec.ts`)).spec,
);
