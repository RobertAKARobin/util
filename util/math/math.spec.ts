import { suite } from '../spec/index.ts';

export const spec = suite(`math/`, {},
	(await import(`./average.spec.ts`)).spec,
	(await import(`./bezierPoint.spec.ts`)).spec,
	(await import(`./constrain.spec.ts`)).spec,
	(await import(`./distance.spec.ts`)).spec,
	(await import(`./intersectionOfLines.spec.ts`)).spec,
	// (await import(`./pathPointNearest.spec.ts`)).spec,
	(await import(`./pointAtPercent.spec.ts`)).spec,
	(await import(`./pointIsOnLine.spec.ts`)).spec,
	(await import(`./pointsToLines.spec.ts`)).spec,
	(await import(`./pointsToMidpoints.spec.ts`)).spec,
	(await import(`./segmentsToPoints.spec.ts`)).spec,
	(await import(`./slope.spec.ts`)).spec,
	(await import(`./sum.spec.ts`)).spec,
	(await import(`./yOffset.spec.ts`)).spec,
);
