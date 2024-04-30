import { renderer, suite } from './spec/index.ts';

import { spec as svg } from './svg/svg.spec.ts';

export const spec = suite(`@robertakarobin/util/`, {},
	svg,
);

const results = await spec({});
const resultsPretty = renderer.render(results);
document.body.innerHTML += `<pre>${resultsPretty}</pre>`;
