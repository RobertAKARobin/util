# Web

## Goals

-	Valid typing
-	Valid HTML
-	No custom template syntax
-	No custom CSS syntax
-	Automates the boring stuff with CSS
-	Produces static HTML/CSS files for SSG
-	Adds interactivity with JS to static HTML files, without needing to rerender
-	Produces interactive sites for CSR
-	Blends seamlessly from static files to CSR
-	Autocompletes routes
-	Markdown support

## Notes

-	The build script copies the contents of `src` to a `tmp` folder so that it can transpile `<markdown>` tags before the TS is compiled. Without this step the Markdown would need to be compiled in the browser. However, if your `tsconfig.json` has path aliases for `src` then it'll keep the Markdown from getting transpiled correctly. To resolve, point your alias to `tmp` as well as `src`, e.g. `paths: { "@src/*": ["tmp/*", "src/*"]}`
-	Have to include `tmp` in the tsconfig `includes` for until TSX fixes an issue with decorators: https://github.com/evanw/esbuild/issues/3496

## TODO

-	Extract out and then reference component baseclass methods, so all subclasses share the same method reference
-	isHydrated

-	CSS class mapping
-	Declare CSS variables inline
-	If class is added via `attrs`, the class should be appended to existing classes
-	Import from other file (ergo SVG)

-	Match routes with params
-	Jump anchors on landing page get overwritten; shouldn't, on static pages
-	Remove CSS from JS bundles
-	Image preprocessing

-	Set initial state values?
-	Autocomplete CSS classes
-	VS plugin for CSS
-	VS plugin for HTML

### WIP

### Done:

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

## Notes

-	Components need a UID so that SSG pages have a way of differentiating between instances
	-	...unless every instance is a new one?
