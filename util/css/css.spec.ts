import { suite } from '../spec/index.ts';

export const spec = suite(`css/`, {},
	(await import(`./keyframes.spec.ts`)).spec,
);
