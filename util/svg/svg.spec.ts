import { suite } from '../spec/index.ts';

const testSvg = await (await fetch(`/svg/test.svg`)).text();

export const spec = suite(`svg/`,
	{
		args: () => {
			const svg = document.querySelector(`svg`);
			if (svg !== null) {
				svg.remove();
			}
			document.body.innerHTML += testSvg;
		},
		timing: `consecutive`,
	},

	(await import(`./svgCreate.spec.ts`)).spec,
	(await import(`./pathPointNearest.spec.ts`)).spec,
	(await import(`./pointToSvg.spec.ts`)).spec,
);
