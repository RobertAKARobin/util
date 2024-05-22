import { css } from '../../util/string/template.js'; // eslint-disable-line no-restricted-imports

const vars = {
	color: `red`,
	width: 1,
};

export default css`
body {
	& h1 {
		color: ${vars.color};

		&.foo {
			border-width: ${vars.width + 1}px;
		}
	}
}
`;
