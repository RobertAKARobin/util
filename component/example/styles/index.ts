import { constants, vars } from './lib';

export const base = () => `
* {
	background: transparent;
	border: 0;
	border-collapse: collapse;
	border-spacing: 0;
	color: inherit;
	font-family: inherit;
	font-size: inherit;
	font-style: inherit;
	font-weight: inherit;
	list-style: none;
	margin: 0;
	padding: 0;
	text-decoration: inherit;
}

:root {
	${Object.entries(constants).map(([constant, value]) => `
		--${constant}: ${value};
	`).join(``)}

	font-family: ${vars(`font--base__family`)};
	font-size: calc(${vars(`font--base__size`)} * 1px);
}
`;
