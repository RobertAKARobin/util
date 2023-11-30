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

## TODO

-	Import from other file (ergo SVG)

-	Match routes with params
-	Remove CSS from JS bundles
-	Image preprocessing

-	Set initial state values?
-	Autocomplete CSS classes
-	Template/CSS prefix
-	VS plugin for CSS
-	VS plugin for HTML

### WIP

-	Jump anchors
-	Components emit events
-	Persist state for elements with UIDs?

### Done:

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
