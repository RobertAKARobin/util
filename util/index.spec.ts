import { run, suite } from './spec/index.ts';

export const spec = suite(`@robertakarobin/js`, {},
	(await import(`./spec/index.spec.ts`)).spec,

	(await import(`./capitalize.spec.ts`)).spec,
	(await import(`./delimiter-pairs.spec.ts`)).spec,
	(await import(`./emitter/emitter.spec.ts`)).spec,
	(await import(`./emitter/entities.spec.ts`)).spec,
	(await import(`./fetchText.spec.ts`)).spec,
	(await import(`./fpsLoop.spec.ts`)).spec,
	(await import(`./keyframes.spec.ts`)).spec,
	(await import(`./math/math.spec.ts`)).spec,
	(await import(`./mixin.spec.ts`)).spec,
	(await import(`./posixPath.spec.ts`)).spec,
	(await import(`./proxyDeep.spec.ts`)).spec,
	(await import(`./querystring.spec.ts`)).spec,
	(await import(`./router.spec.ts`)).spec,
	(await import(`./serialize.spec.ts`)).spec,
	(await import(`./sharedEnv.spec.ts`)).spec,
	(await import(`./sortOn.spec.ts`)).spec,
	(await import(`./template.spec.ts`)).spec,
	(await import(`./transition.spec.ts`)).spec,
	(await import(`./tsvParse.spec.ts`)).spec,
);

run(await spec({}));
