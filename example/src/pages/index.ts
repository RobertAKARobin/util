
import { paths, router } from '@src/router.ts';
import { BasePage } from './_page.ts';
import { List } from '@src/components/list.ts';
import { state } from '@src/state.ts';

List.init();

const style =  `
:host h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

export class IndexPage extends BasePage<{ message: string; }> {
	static style = style;

	anchorlessRoute() {
		router.set(paths.ssgYes);
	}

	template = () => super.template(`
<main>
<h1>Hello world!</h1>

<div id="${router.hashes.homeJump1}">Jump 1</div>

${new List(`mylist`).set(state.entries.$).render()}

<markdown>
# Headline 1

## ${this.value.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p><a href="${paths.ssgYes}">Link to SSG Yes</a></p>

<button type="button" onclick=${this.bind(`anchorlessRoute`)}>Go to SSG Yes</button>

<markdown>
## Headline 2

> Excepteur sint ${`occaecat <markdown>*cupidatat*</markdown> non`} proident.

Joseph's coat was ${colors.join(` and `)}.

-	ut aliquip ex
-	ea commodo consequat.
	-	Duis aute
	-	irure dolor in
-	ut aliquip ex

1.	ut aliquip ex
1.	ea commodo consequat.
	1.	Duis aute
	1.	irure dolor in
1.	ut aliquip ex
</markdown>

<div id="${router.hashes.homeJump2}">Jump 2</div>
</main>
`);
};
