# @robertakarobin/util

Common configurations and helpers for Robin's projects.

If it doesn't have any dependencies then it's probably in here; otherwise it's in another package.

## Contribute

```sh
npm i
npx husky install
```

## Install

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
-	Using `[on]` attributes
	-	+ Easier to debug in HTML
	-	+ Don't need to place event listeners
	-	- Will error if page doesn't have JS
	-	- Verbose
	-	- Not best practice
-	Using JS expressions instead of HTML tags
	-	+ Can set private properties inline
	-	+ Has typing out of the box
	-	+ Don't have to manually import
	-	- Will always call constructor and/or chained functions
	-	- Extra step: have to translate to comment
-	Router outlet
	-	Page extends RouterOutlet
		-	- Rebuilds page on every route
	-	Argument to Resolver
		-	- Resolver is just to map routes to views; shouldn't actually _do_ anything
	-	Renderer
		-	- Importing would import/cache everthing else?
-	Rerendering
	-	toString
		-	returns comment with ID
			-	On first render
				-	If comment with ID
					-	Replace comment with cached component
			-	On rerender
				-	If element with ID
					-	If Component
						-	Replace attributes
						-	cachedComponent.render()
					-	If not component
						-	Replace attributes
						-	Replace children with updatedComponent.childNodes
		-	renders and returns outerHTML
			-	Requires rendering the template twice, which would instantiate double the components
		-	returns outerHTML
			-	On new component, has no content
			-	On existing component, has outdated content
			-	Then render template
-	Layout
	-	Set arbitrary flags on page that determine which outer components get turned on/off?
		-	Gets messy if outer is complicated
	-	Layout component instances
		-	`pageInstace.layout = (new LayoutInstance() || existingLayoutInstance)`
		-	`layout.template = () => this.page`
-	Rerendering
	-	Replace what?
		-	Replace element
			-	/default/
			-	Descending to contents doesn't make sense
		-	Replace element attributes + replace contents
			-	outerHTML
		-	Replace element attributes + evaluate contents
			-	attributes
		-	Replace element attributes
			-	attributes-skip
		-	Replace contents
			-	innerHTML
			-	Descending to contents doesn't make sense
		-	Replace nothing + evaluate contents
			-	static
		-	Replace nothing
			-	static-skip
		-	...replace element + keep contents?
			-	Is that useful?
-	Components need a UID so that SSG pages have a way of differentiating between instances
	-	...unless every instance is a new one?

### Existing frameworks

-	Lit
	-	Have to extend HTMLElement
	-	HTML tagged templates are a little annoying
	-	Have to use shadow DOM for lit-ssr
	-	Have to render first before can rerender
-	Svelte
	-	Magic syntax, e.g. `$` state prefixes
	-	Don't care for route structure
-	Preact
	-	Clunky state management
-	lwc
	-	Limited Typescript support
-	Marko
	-	Weird custom syntax
-	Riot.js
	-	Old and not actively maintained?
-	Stencil
	-

## TODO

-	TODO1: Add reducer functions

-	TODO2: Don't use `[on]` attributes?

-	TODO2: Style setter
-	TODO3: CSS class mapping
-	TODO3: Declare CSS variables inline
-	TODO2: Import from other file (ergo SVG)

-	TODO2: Match routes with params

-	TODO3: Remove CSS from JS bundles
-	TODO2: CSS minify
-	TODO2: HTML minify
-	TODO2: Image preprocessing

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
