import { page } from '@robertakarobin/web';

export const template = () => `
<h1>404 page :(</h1>
`;

export default page({
	importMetaUrl: import.meta.url,
	template,
	title: `Error 404`,
});
