import { createCache, FunctionCache } from 'web/function-cache';

declare let window: FunctionCache;

const bind = createCache(`foo`, { binding: window });

export {
	bind,
};
