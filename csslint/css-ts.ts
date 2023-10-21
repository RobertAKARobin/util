// WIP

const tokens = {
	backtick: `\``,
	cssOpen: `/*css*/\``,
	expressionClose: `\}`,
	expressionOpen: `\$\{`,
	newline: `\n`,
};

const tokensByOrder = Object.entries(tokens) as Array<[TokenName, string]>;

type TokenName = keyof typeof tokens;

type Token = {
	index: number;
	type: TokenName;
};

export function tokenizer(input: string) {
	const out: Array<Token | string> = [];
	let remainder = input;

	while(remainder) {
		let nearest = {
			position: Infinity,
			token: null as unknown as string,
			tokenName: null as unknown as TokenName,
		};

		for (const [tokenName, token] of tokensByOrder) {
			const tokenStart = remainder.indexOf(token);
			if (tokenStart >= 0 && (tokenStart < nearest.position)) {
				nearest = {
					position: tokenStart,
					token,
					tokenName,
				};
			}

			if (tokenStart === 0) {
				break;
			}
		}

		if (nearest.position === Infinity) {
			return;
		}

		const words = remainder.substring(0, nearest.position);
		if (words.length > 0) {
			out.push(words);
		}

		const token: Token = {
			index: out.length,
			type: nearest.tokenName,
		};

		out.push(token);
		remainder = remainder.substring(nearest.position + nearest.token.length);
	}

	console.log(out);
}
