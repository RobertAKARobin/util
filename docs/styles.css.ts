import { constants, vars } from './styles/lib/index.css';

export default `
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

	background-color: #000000;
	font-family: ${vars(`font--base__family`)};
	font-size: calc(${vars(`font--base__size`)} * 1px);
}

.view {
	aspect-ratio: ${vars(`aspect`)};
	background-color: #FFFFFF;
	height: 100vh;
	margin: 0 auto;
}
`;
