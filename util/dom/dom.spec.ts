import { suite } from '../spec/index.ts';

export const spec = suite(`dom/`, {},
	(await import(`./attributes.spec.ts`)).spec,
);
