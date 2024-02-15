export const foo = /*css*/`
:host {
	color: red;
}
`;

const color = `blue`;
const colors: Array<string> = [];
export const bar = /*css*/`
:host {
	color: ${color};

	${colors.map(color => /*css*/`
		--color-${color}: ${color};
	`)}
}
`;
