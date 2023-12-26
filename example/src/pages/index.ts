import { PageFactory } from '@robertakarobin/web/component.ts';

import { Link, router } from '@src/router.ts';
import { layout } from './_layout.ts';
import { List } from '@src/components/list.ts';
import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';
import { ProgressModal } from '@src/modals/progress.ts';
import { state } from '@src/state.ts';
import { TransitionTest } from '@src/components/transition-test.ts';

const style =  `
:host h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

export class IndexPage extends PageFactory(`main`, {
	'data-message': {
		default: ``,
	},
}) {
	static style = style;

	static {
		this.init();
	}

	anchorlessRoute() {
		router.to(`ssgYes`);
	}

	openModal() {
		ModalContainer.get().place(new ProgressModal());
	}

	template = () => layout(`
<h1>Hello world!</h1>

${TransitionTest.get()}

<button
	onclick="${this.bind(`openModal`)}"
type="button"
>Modal</button>

<div id="${router.hashes.homeJump1}">Jump 1</div>

${List.get().setListItems(state.entries.$)}

<markdown>
# Headline 1

## ${this.get(`data-message`)}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${Link.to(`ssgYes`, `Link to SSG Yes`)}</p>

<button type="button" onclick="this.closest(IndexPage).anchorlessRoute()">Go to SSG Yes</button>

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
`);
};
