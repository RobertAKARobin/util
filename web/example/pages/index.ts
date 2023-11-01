import { page } from '@robertakarobin/web/plugins/page.ts';
import { withStyle } from '@robertakarobin/web/plugins/withStyle.ts';

import { staticLayout } from './_staticLayout.ts';

export const style = `
h1 {
	color: red;
}
`;

export const template = () => `
<h1>Hello world!</h1>
`;

export const indexPage = page(`Home page`, staticLayout, withStyle(style, template));
