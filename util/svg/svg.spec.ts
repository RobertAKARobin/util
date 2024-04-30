import { suite } from '../spec/index.ts';

const testSvg = await (await fetch(`/svg/test.svg`)).text();
document.body.innerHTML += testSvg;

export const spec = suite(`svg/`, {},
	(await import(`./pathPointNearest.spec.ts`)).spec,
);
