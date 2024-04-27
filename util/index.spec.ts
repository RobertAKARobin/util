import { run, suite } from './spec/index.ts';

export const spec = suite(`@robertakarobin/util/`, {},
	(await import(`./components/component.spec.ts`)).spec,
	(await import(`./css/css.spec.ts`)).spec,
	(await import(`./date/date.spec.ts`)).spec,
	(await import(`./emitter/emitter.spec.ts`)).spec,
	(await import(`./math/math.spec.ts`)).spec,
	(await import(`./node/node.spec.ts`)).spec,
	(await import(`./spec/spec.spec.ts`)).spec,
	(await import(`./string/string.spec.ts`)).spec,
	(await import(`./time/time.spec.ts`)).spec,

	(await import(`./assert.spec.ts`)).spec,
	(await import(`./fetchText.spec.ts`)).spec,
	(await import(`./mixin.spec.ts`)).spec,
	(await import(`./proxyDeep.spec.ts`)).spec,
	(await import(`./querystring.spec.ts`)).spec,
	(await import(`./router.spec.ts`)).spec,
	(await import(`./serialize.spec.ts`)).spec,
	(await import(`./sharedEnv.spec.ts`)).spec,
	(await import(`./sortOn.spec.ts`)).spec,
	(await import(`./tsvParse.spec.ts`)).spec,
);

run(await spec({}));
