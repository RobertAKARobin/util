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
var template = (message) => `
<h1>Hello world!</h1>

<markdown>
# Headline 1 ${message}

## ${message}

${textbox_default()}

${textbox_default()}`;
var IndexPage = class extends Page {
  splitImportMetaUrl = import.meta.url;
  style = style;
  template = template;
  title = `Home page`;
};
var pages_default = Page.toFunction(IndexPage);
export {
  IndexPage,
  pages_default as default
};
