import { css } from '../../util/string/template.js';

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
