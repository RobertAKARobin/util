const codesByName = {
	black: 30,
	blackBg: 40,
	blue: 34,
	blueBg: 44,
	blueLight: 94,
	blueLightBg: 104,
	cyan: 36,
	cyanBg: 46,
	cyanLight: 96,
	cyanLightBg: 106,
	grayDark: 90,
	grayDarkBg: 100,
	grayLight: 37,
	grayLightBg: 47,
	green: 32,
	greenBg: 42,
	greenLight: 92,
	greenLightBg: 102,
	magenta: 35,
	magentaBg: 45,
	magentaLight: 95,
	magentaLightBg: 105,
	normal: 39,
	normalBg: 49,
	red: 31,
	redBg: 41,
	redLight: 91,
	redLightBg: 101,
	white: 97,
	whiteBg: 107,
	yellow: 33,
	yellowBg: 43,
	yellowLight: 93,
	yellowLightBg: 103,

	blink: 5,
	blinkNot: 25,
	bold: 1,
	boldNot: 21,
	dim: 2,
	dimNot: 22,
	hidden: 8,
	hiddenNot: 28,
	invert: 7,
	invertNot: 27,
	underlined: 4,
	underlinedNot: 24,

	reset: 0,
};

const codes = new Set<number>();

export const colors = Object.entries(codesByName).reduce((colors, [name, code]) => {
	if (codes.has(code)) { // Checking my work
		throw new Error(`Color ${name} code ${code} already used.`);
	} else {
		codes.add(code);
	}

	colors[name as keyof typeof codesByName] = `\x1b[${code}m`;
	return colors;
}, {} as Record<keyof typeof codesByName, string>);

export const color = (
	message: string,
	...args: Array<keyof typeof colors>
) => {
	return `\x1b[${args.map(color => codesByName[color]).join(`;`)}m${message}${colors.reset}`;
};
