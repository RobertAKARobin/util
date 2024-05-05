import { run, suite } from './spec/index.ts';

export const spec = suite(`@robertakarobin/util/`, {},
	(await import(`./components/component.spec.ts`)).spec,
	(await import(`./css/keyframes.spec.ts`)).spec,
	(await import(`./date/ampmToDate.spec.ts`)).spec,
	(await import(`./date/dateFormat.spec.ts`)).spec,
	(await import(`./date/dayEnd.spec.ts`)).spec,
	(await import(`./dom/listenOnce.spec.ts`)).spec,
	(await import(`./dom/attributes.spec.ts`)).spec,
	(await import(`./emitter/emitter.spec.ts`)).spec,
	(await import(`./emitter/entities.spec.ts`)).spec,
	(await import(`./group/arrayCoerce.spec.ts`)).spec,
	(await import(`./group/arrayFromKeys.spec.ts`)).spec,
	(await import(`./group/arrayToDict.spec.ts`)).spec,
	(await import(`./group/arrayToEnum.spec.ts`)).spec,
	(await import(`./group/arrayToGroups.spec.ts`)).spec,
	(await import(`./group/enumy.spec.ts`)).spec,
	(await import(`./group/indexOn.spec.ts`)).spec,
	(await import(`./group/indexesByValues.spec.ts`)).spec,
	(await import(`./group/mapObject.spec.ts`)).spec,
	(await import(`./group/omit.spec.ts`)).spec,
	(await import(`./group/nTimes.spec.ts`)).spec,
	(await import(`./group/serialize.spec.ts`)).spec,
	(await import(`./group/sortOn.spec.ts`)).spec,
	(await import(`./math/average.spec.ts`)).spec,
	(await import(`./math/bezierPoint.spec.ts`)).spec,
	(await import(`./math/constrain.spec.ts`)).spec,
	(await import(`./math/distance.spec.ts`)).spec,
	(await import(`./math/intersectionOfLines.spec.ts`)).spec,
	// (await import(`./math/pathPointNearest.spec.ts`)).spec,
	(await import(`./math/pointAtPercent.spec.ts`)).spec,
	(await import(`./math/pointIsOnLine.spec.ts`)).spec,
	(await import(`./math/pointsToLines.spec.ts`)).spec,
	(await import(`./math/pointsToMidpoints.spec.ts`)).spec,
	(await import(`./math/segmentsToPoints.spec.ts`)).spec,
	(await import(`./math/slope.spec.ts`)).spec,
	(await import(`./math/sum.spec.ts`)).spec,
	(await import(`./math/yOffset.spec.ts`)).spec,
	(await import(`./node/posixPath.spec.ts`)).spec,
	(await import(`./spec/spec.spec.ts`)).spec, // Sounds like a sprinkler!
	(await import(`./string/capitalize.spec.ts`)).spec,
	(await import(`./string/deleteAt.spec.ts`)).spec,
	(await import(`./string/delimiter-pairs.spec.ts`)).spec,
	(await import(`./string/template.spec.ts`)).spec,
	(await import(`./time/defer.spec.ts`)).spec,
	(await import(`./time/fpsLoop.spec.ts`)).spec,
	(await import(`./time/soFar.spec.ts`)).spec,
	(await import(`./time/transition.spec.ts`)).spec,
	(await import(`./web/querystring.spec.ts`)).spec,
	(await import(`./web/router.spec.ts`)).spec,
	(await import(`./web/sharedEnv.spec.ts`)).spec,

	(await import(`./assert.spec.ts`)).spec,
	(await import(`./fetchText.spec.ts`)).spec,
	(await import(`./mixin.spec.ts`)).spec,
	(await import(`./proxyDeep.spec.ts`)).spec,
	(await import(`./tsvParse.spec.ts`)).spec,
);

run(await spec({}));
