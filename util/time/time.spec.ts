import { suite } from '../spec/index.ts';

export const spec = suite(`time/`, {},
	(await import(`./defer.spec.ts`)).spec,
	(await import(`./fpsLoop.spec.ts`)).spec,
	(await import(`./soFar.spec.ts`)).spec,
	(await import(`./transition.spec.ts`)).spec,
);
