import { page } from '@robertakarobin/web';

export default (
	title: string,
	load: `bundle` | `dynamic`,
	fallback: boolean,
) => page({
	importMetaUrl: fallback ? undefined : import.meta.url,
	template: () => `<h1>${title}</h1>`,
	title,
});
