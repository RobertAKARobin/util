# @robertakarobin/path-data-polyfill

A wrapper around [path-data-polyfill](https://www.npmjs.com/package/path-data-polyfill) that just declares its types so it's Typescript-compatible.

## Usage

```ts
import '@robertakarobin/path-data-polyfill';

const path = document.querySelector(`path`)!;
path.getPathData({ normalize: true }); // By importing this package, `getPathData` and `setPathData` have been added to the SVGPathElement prototype
```
