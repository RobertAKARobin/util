import { styled } from '@robertakarobin/web/components/style.ts';

export const style = `
h1 {
	color: red;
}
`;

export const template = () => `
<h1>Hello world!</h1>
`;

export const indexPage = styled(style, template);
