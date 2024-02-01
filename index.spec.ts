import { run, suite } from './spec/index.ts';

export const spec = suite(`@robertakarobin/js`, {},
	(await import(`./spec/index.spec.ts`)).spec,
	(await import(`./emitter.spec.ts`)).spec,
	(await import(`./entities.spec.ts`)).spec,
	(await import(`./keyframes.spec.ts`)).spec,
	(await import(`./mixin.spec.ts`)).spec,
	(await import(`./router.spec.ts`)).spec,
	(await import(`./serialize.spec.ts`)).spec,
	(await import(`./sortOn.spec.ts`)).spec,
	(await import(`./string-mates.spec.ts`)).spec,
	(await import(`./template.spec.ts`)).spec,
);

run(await spec({}));
