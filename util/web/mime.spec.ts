import { test } from '../spec/index';

import { mimeFor } from './mime';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(mimeFor(`foo.jpg`)) === x(`image/jpeg`));
	$.assert(x => x(mimeFor(`foo.jpeg`)) === x(`image/jpeg`));
	$.assert(x => x(mimeFor(`.jpg`)) === x(`image/jpeg`));
	$.assert(x => x(mimeFor(`.jpeg`)) === x(`image/jpeg`));
	$.assert(x => x(mimeFor(`https://foo.bar.baz/boo/bar/zoo.html`)) === x(`text/html`));
	$.assert(x => x(mimeFor(`foo.bar.baz/boo/bar/zoo.json`)) === x(`application/json`));
	$.assert(x => x(mimeFor(`foo.bar.baz/boo/bar/zoo`)) === x(``));
});
