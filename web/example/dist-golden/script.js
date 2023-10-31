"use strict";
(() => {
  // web/lib/function-cache.ts
  function functionCache(bindingName, options = {}) {
    const functionsByKey = /* @__PURE__ */ new Map();
    const keysByFunction = /* @__PURE__ */ new Map();
    let cacheIndex = 0;
    if (options.binding) {
      options.binding[bindingName] = functionsByKey;
    }
    return function bind2(inputFunction, ...args) {
      let cacheKey2 = keysByFunction.get(inputFunction);
      if (typeof cacheKey2 === `undefined`) {
        cacheKey2 = `f${cacheIndex}`;
        cacheIndex += 1;
        functionsByKey.set(cacheKey2, inputFunction);
        keysByFunction.set(inputFunction, cacheKey2);
      }
      const argsString = args.map((arg) => `'${arg}'`).join(``);
      return `"${String(bindingName)}.get('${cacheKey2}').call(this, event, ${argsString})"`;
    };
  }

  // emit/index.ts
  var Emitter = class _Emitter {
    /** A collection of all active subscriptions to all Emitters. Used to debug memory management. */
    static subscriptions = /* @__PURE__ */ new Set();
    // eslint-disable-line @typescript-eslint/no-explicit-any
    /** @see {@link EmitterCache} */
    cache;
    get last() {
      return this.cache?.list?.[0];
    }
    /** A collection of all active subcriptions to this Emitter. */
    subscriptions = /* @__PURE__ */ new Set();
    constructor(options = {}) {
      this.cache = new EmitterCache(options.cache ?? {});
    }
    next(value) {
      this.cache.add(value);
      for (const subscription of this.subscriptions) {
        subscription.onEmit?.(value);
      }
    }
    subscribe(onEvent) {
      const subscription = new Subscription(this, onEvent);
      _Emitter.subscriptions.add(subscription);
      this.subscriptions.add(subscription);
      return subscription;
    }
    unsubscribe(subscription) {
      _Emitter.subscriptions.delete(subscription);
      this.subscriptions.delete(subscription);
    }
    unsubscribeAll() {
      this.subscriptions.forEach(_Emitter.subscriptions.delete);
      this.subscriptions.clear();
    }
  };
  var EmitterCache = class {
    /** The quantity of values to cache. */
    limit;
    get list() {
      return [...this.memory];
    }
    memory = [];
    constructor(options = {}) {
      this.limit = options.limit ?? EmitterCacheOptionsDefault.limit;
    }
    add(value) {
      return this.addMany([value]);
    }
    addMany(values) {
      if (this.limit <= 0) {
        return;
      }
      this.memory.unshift(...values);
      this.memory.splice(this.limit);
    }
  };
  var EmitterCacheOptionsDefault = {
    limit: 1
  };
  var Subscription = class {
    constructor(emitter, onEmit) {
      this.emitter = emitter;
      this.onEmit = onEmit;
    }
    destroy() {
      this.emitter.unsubscribe(this);
    }
  };

  // web/router.ts
  var routerContext = typeof window !== `undefined` ? `client` : `static`;
  var Router__Client = class extends Emitter {
    constructor() {
      super({
        cache: {
          limit: 1
        }
      });
      window.onpopstate = window.onload = this.onChange.bind(this);
    }
    onChange() {
      const newPath = window.location.pathname;
      if (newPath !== this.last) {
        this.next(newPath);
      }
    }
  };
  var Router__Static = class extends Emitter {
  };
  var router = routerContext === `client` ? new Router__Client() : new Router__Static();

  // web/component.ts
  var cacheKey = `fn`;
  var bind = routerContext === `client` ? functionCache(cacheKey, { binding: window }) : functionCache(cacheKey);
  var Component = class _Component {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    constructor(template, style) {
      this.template = template;
      this.style = style;
    }
    static styleCache = /* @__PURE__ */ new WeakMap();
    render(...args) {
      this.renderStyle();
      return this.renderTemplate(...args);
    }
    renderStyle() {
      if (routerContext !== `client`) {
        return;
      }
      if (!this.style) {
        return;
      }
      const existingStyle = _Component.styleCache.get(this);
      if (existingStyle) {
        return;
      }
      const $style = document.createElement(`style`);
      $style.textContent = this.style;
      document.head.appendChild($style);
      _Component.styleCache.set(this, $style);
    }
    renderTemplate(...args) {
      return this.template(...args);
    }
  };
  var toAttributes = (input) => Object.entries(input).map(([key, value]) => `${key}="${value}"`).join(` `);

  // web/components/link.ts
  var routeTo = (event, path) => {
    if (event.metaKey || event.ctrlKey) {
      return;
    }
    event.preventDefault();
    window.history.pushState({}, ``, path);
    router.next(path);
  };
  var absoluteUrl = /^\w+\:\/\//;
  var link = new Component(
    ({ href, content, ...rest }) => {
      const isAbsolute = absoluteUrl.test(href);
      return `
			<a
				href="${href}"
				${isAbsolute || routerContext === `client` ? `onclick="${bind(routeTo, href)}"` : ``}
				target="${isAbsolute ? `_blank` : `_self`}"
				${toAttributes(rest)}
				>
				${content || ``}
			</a>
		`;
    }
  );

  // web/example/pages/error.ts
  var errorPage = new Component(
    () => `
	<h1>404 page :(</h1>

	<p>${link.render({ content: `Go home`, href: routes.home })}</p>
	`
  );

  // web/example/pages/index.ts
  var indexPage = new Component(
    () => `
	<h1>Hello world!</h1>
	`,
    `
	h1 {
		color: red;
	}
	`
  );

  // web/example/pages/_layout.ts
  var layout = new Component(
    (title, contents) => {
      if (routerContext === `client`) {
        document.title = title;
        return contents;
      }
      return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<title>${title}</title>
				<script src="/script.js" type="module"><\/script>
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body>
				<div
					class="view"
					id="output"
				>${contents}</div>
			</body>
		</html>`;
    }
  );

  // web/example/routes.ts
  var routes = {
    home: `/`
  };
  var resolve = (input) => {
    switch (input.path) {
      case routes.home:
        return layout.render(`Home page`, indexPage.render());
      default:
        return layout.render(`Error 404`, errorPage.render());
    }
  };

  // web/example/script.ts
  var $output = document.getElementById(`output`);
  router.subscribe((path) => {
    $output.innerHTML = resolve({
      path,
      routerContext: `client`
    });
  });
})();
