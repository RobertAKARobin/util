import { suite } from '../spec/index.ts';

export const spec = suite(`node/`, {},
	(await import(`./posixPath.spec.ts`)).spec,
);
