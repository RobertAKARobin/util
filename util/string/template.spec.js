import { test } from '../spec/index';

import { css, html } from './template';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(html`<div>${`foo`}</div>`) === `<div>foo</div>`);
	$.assert(x => x(css`${css`div { ${css`div { color: red; }`} }`}`) === `div { div { color: red; } }`);
});
