// ../src/pages/index.ts
import { Page } from "/web.js";

// ../src/components/textbox.ts
import { Component } from "/web.js";
var Textbox = class extends Component {
  max = 10;
  value = ``;
  handleInput(event) {
    this.value = event.currentTarget.value;
    this.$root.querySelector(`span`).innerHTML = this.remaining();
  }
  remaining() {
    return `
		${this.max - this.value.length} / ${this.max} Remaining
		`;
  }
  template() {
    return `
		<div>
			<input
				oninput=${this.bind(`handleInput`)}
				maxlength="${this.max}"
				placeholder="Type here"
				type="text"
				value="${this.value}"
				/>

			<span>${this.remaining()}</span>
		</div>
		`;
  }
};
var textbox_default = Component.toFunction(Textbox);

// ../src/pages/index.ts
var style = `
h1 {
	color: red;
}
`;
var colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];
var template = (message) => `
<h1>Hello world!</h1>

<h1>Headline 1</h1>
<h2>${message}</h2>
<div>${textbox_default()}</div>

<div>${textbox_default()}</div>

<p>Lorem ipsum dolor <strong>sit amet</strong>, consectetur <em>adipiscing elit</em>, sed do <em>eiusmod tempor</em> incididunt.</p>
<p>Duis aute voluptate <a href="https://example.com">velit esse cillum</a> dolore /eu fugiat/ nulla pariatur.</p>


<h2>Headline 2</h2>
<blockquote>
<p>Excepteur sint ${`occaecat cupidatat non`} proident.</p>
</blockquote>
<p>Joseph&#39;s coat was ${colors.join(` and `)}.</p>
<ul>
<li>   ut aliquip ex</li>
<li>   ea commodo consequat.<ul>
<li>   Duis aute</li>
<li>   irure dolor in</li>
</ul>
</li>
<li>   ut aliquip ex</li>
</ul>
<ol>
<li>   ut aliquip ex</li>
<li>   ea commodo consequat.<ol>
<li>   Duis aute</li>
<li>   irure dolor in</li>
</ol>
</li>
<li>   ut aliquip ex</li>
</ol>

`;
var IndexPage = class extends Page {
  importMetaUrl = import.meta.url;
  style = style;
  template = template;
  title = `Home page`;
};
var pages_default = Page.toFunction(IndexPage);
export {
  IndexPage,
  pages_default as default
};
