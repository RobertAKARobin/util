import { FunctionCache, createCache } from 'component/src/function-cache.ts';

declare let window: FunctionCache;

const bind = createCache(`foo`, { binding: window });

export {
	bind,
};
