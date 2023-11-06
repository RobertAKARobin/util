import { page } from '@robertakarobin/web';

export default page({
	importMetaUrl: import.meta.url,
	template: () => `<h1>Split fallback</h1>`,
	title: `Split`,
});

