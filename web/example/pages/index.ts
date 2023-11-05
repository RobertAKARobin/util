import { page } from '@robertakarobin/web';

export const style = `
h1 {
	color: red;
}
`;

export const template = () => `
<h1>Hello world!</h1>
`;

export default page({
	importMetaUrl: import.meta.url,
	style,
	template,
	title: `Home page`,
});
