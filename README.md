# @robertakarobin/util

Common configurations and helpers for Robin's projects.

If it doesn't have any dependencies then it's probably in here; otherwise it's in another package.

## Contribute

```sh
npm i
npx husky install
```

## Install

See also: https://github.com/robertakarobin/util-starter

```sh
cd my_project
npm i -S https://github.com/robertakarobin/util.git
```

### VSCode

```sh
cp -R ./node_modules/@robertakarobin/util/.vscode .vscode
```

(When/if https://github.com/microsoft/vscode/issues/15909 is done, extend the settings intead.)

### Typescript

When prompted whether you want VSCode to use the locally-installed Typescript, select 'Yes'.

## Goals

-	Valid typing
-	Valid HTML
-	No custom template syntax
-	No custom CSS syntax
-	No custom VSCode extension required
-	No 3rd party modules for front-end code, and for back-end code only when it would otherwise require reinventing a big ol' wheel beyond the day-to-day of making a web app
-	Automates boring CSS stuff
-	Produces static HTML/CSS files for SSG
-	Adds interactivity with JS to static HTML files, without needing to rerender
-	Specify what should get rerendered, when and where
-	Produces interactive sites for CSR
-	Blends seamlessly from static files to CSR
-	Autocompletes routes
-	Markdown support

## Notes

-	The build script copies the contents of `src` to a `tmp` folder so that it can transpile `<markdown>` tags before the TS is compiled. Without this step the Markdown would need to be compiled in the browser. However, if your `tsconfig.json` has path aliases for `src` then it'll keep the Markdown from getting transpiled correctly. To resolve, point your alias to `tmp` as well as `src`, e.g. `paths: { "@src/*": ["tmp/*", "src/*"]}`
-	Have to include `tmp` in the tsconfig `includes` until TSX fixes an issue with decorators: https://github.com/evanw/esbuild/issues/3496

## TODO

-	TODO1: Add TS preprocessing back in
-	TODO1: Don't refer to functions by string -- keeps names from being minified
-	TODO1: Image preprocessing
-	TODO1: Import SVGs/arbitrary files
-	TODO2: Use `#` private fields
-	TODO3: Strong typing for CSS classes and CSS variables
-	TODO3: rm dependence on Esbuild
	-	Probably not possible since code is transpiled for the front-end. Esbuild has 0(?) dependencies anyway
-	TODO3: rm dependence on JSDOM
	-	Got pretty close by writing my own "dummy DOM", but we want the HTML rendered on the server to match what is rendered in the browser as much as possible, which would require reinventing a lot of wheels that JSDOM has already invented.
-	TODO3: Lint HTML in JS template literals (https://github.com/yeonjuan/html-eslint/issues/196)

### Done:

-	HTML linting
-	Remove CSS from JS bundles
-	Allow anonymous event handlers, for when we know a component won't be SSGd
-	A way to cache DOM queries, like Angular's ViewChild
-	Fully hydrate the template on the landing page -- e.g. with event listeners and stuff -- without needing to rerender it
-	Don't use `[on]` attributes?
-	Style setter
-	Specify which routes to build in build config, not with `isSSG`
-	Match routes with params
-	Add reducer functions
	-	I'm calling them formatters, since (a) reducers involve actions, and (b) "reducer" is a confusing name
-	onEl => onConstruct
-	Extract out link component
-	Make Emitter subscriptions strong by default
-	Make `Component.instances` weak
-	Extract `util/index.ts` to separate files, for code splitting
-	Add isHydrated option
-	Don't require script
-	Bust CSS cache
-	Add minify as build option
-	Template/CSS prefix
-	.bind works on emitters too
-	Use constructor to create or get existing instance
-	Components emit events
-	Show `[data-component]` on build?
-	Jump anchors
-	Base URI
-	Add route helper
-	Don't use `Component.push` in `<script>`
-	Set absolute path for imports
-	Extract `window.` boilerplate to beginning of layout
-	Automatically set HTML attributes
-	Differentiate between weak/strong subscriptions
-	Add config with HTML/CSS validator/formatter
-	Fix Windows paths
-	toFunction should return the instance
-	Component content shouldn't be duplicated
-	Bug: Instances not binding to elements on rerender
-	`bind` without needing page referesh
-	Route names for HTML IDs
-	Fix `route()` names not bring strongly typed
-	CSS to external
-	Vendor doesn't need own bundle
-	CSS breakpoints
-	Declare CSS variables inline
-	Get CSS variable names inline
-	Support nested tokens
-	Bundle all components/pages together
-	Markdown support
-	Include CSS on fallback pages
