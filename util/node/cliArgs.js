/**
 * @import { PropertyOf } from '../types.d';
 */

export const defaultFlagMatcher = /^-(.*?)(=(.*))?$/; // TODO3: Pass in as an option

/**
 * Parses and returns 0 or more "flag" params (that begin with `-`) from an array of strings (e.g. `process.argv`)
 * @template {object} Flags
 * @param {Array<string>} params
 * @param {object} [options]
 * @param {string} [options.flagMatcher]
 * @returns {[Flags, ...Array<string>]}
 */
export function cliArgs(params, options = {}) {
	const flagMatcher = options.flagMatcher === undefined
		? defaultFlagMatcher
		: new RegExp(options.flagMatcher);

	const flags = /** @type {Flags} */({});
	const rest = /** @type {Array<string>} */([]);

	for (const param of params) {
		const match = param.match(flagMatcher);
		if (match === null) {
			rest.push(param);
			continue;
		}

		const [_full, _flagName, _nil, flagValue] = match;
		const flagName = /** @type {keyof Flags} */(_flagName);
		flags[flagName] = /** @type {PropertyOf<Flags>} */(flagValue ?? `true`);
	}

	return [flags, ...rest];
}
