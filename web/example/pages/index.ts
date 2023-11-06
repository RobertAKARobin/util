import { page } from '@robertakarobin/web';

import textbox from '../components/textbox.ts';

export const style = `
h1 {
	color: red;
}
`;

export const template = () => `
<h1>Hello world!</h1>

${textbox()}

${textbox()}
`;

export default page({
	importMetaUrl: import.meta.url,
	style,
	template,
	title: `Home page`,
});
