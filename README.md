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
