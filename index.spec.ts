import { print, suite } from './spec/index.ts';

export const spec = suite(`@robertakarobin/js`, {},
	(await import(`./spec/index.spec.ts`)).spec,
	(await import(`./emitter.spec.ts`)).spec,
	(await import(`./entities.spec.ts`)).spec,
	(await import(`./keyframes.spec.ts`)).spec,
	(await import(`./mixin.spec.ts`)).spec,
	(await import(`./serialize.spec.ts`)).spec,
	(await import(`./string-mates.spec.ts`)).spec,
	(await import(`./template.spec.ts`)).spec,
);

print(await spec({}));
