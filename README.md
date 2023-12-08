# @robertakarobin/util

Common configurations and helpers for Robin's projects.

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

# Style notes

## JS

- Use `data-` attributes to select items with JS, not CSS classes.
- Use the global namespace when calling global variables.

    Yes:
    ```js
    window.location
    ```

    No:
    ```js
    location
    ```

## CSS

- Put classes in alphabetical order.

    Otherwise everyone kind-of comes up with their own order. Alphabetical isn't perfect, but at least it's consistent.

- Prefix scoped/component classes with `_`.

    This way it's easier to tell in HTML whether a class is global or local.

- In HTML, put scoped/component classes after global classes

    e.g. `<div class="global _local">`. Local classes should override global classes.

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

-	Don't require script
-	CSS class mapping
-	Declare CSS variables inline
-	If class is added to element, the class should be appended to existing classes
-	Add isHydrated option
-	Hydrate without `.init`?
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
