import { suite } from '../spec/index.ts';

export const spec = suite(`string/`, {},
	(await import(`./capitalize.spec.ts`)).spec,
	(await import(`./deleteAt.spec.ts`)).spec,
	(await import(`./delimiter-pairs.spec.ts`)).spec,
	(await import(`./template.spec.ts`)).spec,
);
