export const defaultFlagMatcher = /^-(.*?)(=(.*))?$/; // TODO3: Pass in as an option

/**
 * Parses and returns 0 or more "flag" params (that begin with `-`) from an array of strings (e.g. `process.argv`)
 */
export function cliArgs<Flags extends Record<string, string>>(
	params: Array<string>,
	options: {
		flagMatcher?: string;
	} = {},
): [Flags, ...Array<string>] {
	const flagMatcher = options.flagMatcher === undefined
		? defaultFlagMatcher
		: new RegExp(options.flagMatcher);

	const flags = {} as Flags;
	const rest = [] as Array<string>;

	for (const param of params) {
		const match = param.match(flagMatcher);
		if (match === null) {
			rest.push(param);
			continue;
		}

		const [_full, flagName, _nil, flagValue] = match;
		flags[flagName as keyof Flags] = (flagValue ?? `true`) as Flags[keyof Flags];
	}

	return [flags, ...rest];
}
