# @robertakarobin/util

Common configurations and helpers for Robin's projects.

## Installation

### For development

```
cd util
npm i
npx husky install
```

### For usage

```
cd my_project
npm i -S https://github.com/robertakarobin/util.git
npm i -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser stylelint
```

Then add:

```
// .vscode/settings.json
// @see ./vscode/settings.json
// TODO3: Extend settings instead, when/if https://github.com/microsoft/vscode/issues/15909 is done
```

```
// package.json
{
	"scripts": {
		"lint": "eslint --ext .js,.json,.ts ."
	}
}
```

```
// .eslintrc.json
{
	"extends": [
		"./node_modules/@robertakarobin/util/.eslintrc.json"
	]
}
```

```
// .stylelintrc.json
{
	"extends": [
		"./node_modules/@robertakarobin/util/.stylelintrc.json"
	]
}
```

#### Extending lint rules

This isn't configured to be an ESLint config package (e.g. by naming it `eslint-config-*`). So, you'll need to extend its .eslintrc.json by using the actual file path:

```
{
	"extends": [
		"./node_modules/@robertakarobin/util/.eslintrc.json"
	]
}
```

Note that `stylelint.extends` appears to work fine regardless of whether you specify `./node_modules`.

# Style guide

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

- Use compound classes with a prefix, [BEM-style](https://getbem.com/introduction/).

    e.g. `<div class="hero"><img class="hero__bg"></div>`

    This makes the CSS better reflect the structure of the HTML. Start a new compound class when an element is stylistically independent of its parent. Hard rule to enforce; you sorta know it when you see it.

- Nest compound classes using `&`.

    For example, instead of:
    ```
    .hero {}
    .hero__bg {}
    ```
    ...do this:
    ```
    .hero {
        &__bg {}
    }
    ```

    This cuts down on the amount of CSS we need to write, makes it easier to change class prefixes, makes the CSS better reflect the structure of the HTML, and means you get a nice collapsible tree in VSCode.

- Prefix scoped/component classes with `_`.

    This way it's easier to tell in HTML whether a class is global or local.

- In HTML, put scoped/component classes after global classes

    e.g. `<div class="global _local">`. Local classes should override global classes.

- Nest `@media` inside a compound class's topmost element, if possible.

    No, because if @media isn't alongside the elements it affects, things get disorganized.
    ```
    .hero {
        &__bg {}
    }

    .footer {}

    @media {
        .hero {
            &__bg {}
        }
    }
    ```

    The exception is if a @media rule applies the same CSS to multiple elements:
    ```
    @media {
        .hero,
        .footer {}
    }
    ```

    No, because if @media are inside the most specific selectors you end up with a bunch of disjointed @media all over the place.
    ```
    .hero {
        &__bg {
            @media {}
        }
    }
    ```

    Yes:
    ```
    .hero {
        &__bg {}

        @media {
            &__bg{}
        }
    }

    .footer {}
    ```
