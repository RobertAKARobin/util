import { suite } from '@robertakarobin/util/spec/index.ts';;

export const spec = suite(`@robertakarobin/js`, {},
	(await import(`./build.spec.ts`)).spec,
	(await import(`./component.spec.ts`)).spec,
);
