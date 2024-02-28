import { test } from '../spec/index.ts';

import { css, html } from './template.ts';

export const spec = test(`Tagged templates`, $ => {
	$.assert(x => x(html`<div>${`foo`}</div>`) === `<div>foo</div>`);
	$.assert(x => x(css`${css`div { ${css`div { color: red; }`} }`}`) === `div { div { color: red; } }`);
});
