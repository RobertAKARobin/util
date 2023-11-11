// ../tmp/pages/error.ts
import { Page } from "/web.js";
var ErrorPage = class extends Page {
  importMetaUrl = import.meta.url;
  title = `Error 404`;
  template() {
    return `
		<h1>404 page :(</h1>
		`;
  }
};
var error_default = Page.toFunction(ErrorPage);
export {
  ErrorPage,
  error_default as default
};
