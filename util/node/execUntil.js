/**
 * @import { ExecOptions, ExecResult } from './execAsync.js';
 */

import { execAsync } from './execAsync.js';
import { tryCatch } from '../tryCatch.js';

/**
 * @typedef {ExecResult & {
 * error?: Error;
 * }} ExecUntilResult
 */

/**
 * @typedef {{
 * attempt: number;
 * previous: ExecUntilResult | undefined;
 * }} ExecUntilState
 */

/**
 * @typedef {{
 * attemptsMax?: number;
 * doCatch?: boolean;
 * }} ExecUntilOptions
 */

/**
 * Run command until the given condition is met.
 * @param {string | ((state: ExecUntilState) => string)} command
 * @param {(state: ExecUntilState & { result: ExecUntilResult }) => boolean} endCondition
 * @param {ExecOptions & ExecUntilOptions} [options]
 * @returns {Promise<ExecUntilResult>}
 */
export async function execUntil(
	command,
	endCondition,
	options = { encoding: `utf8` },
) {
	const attemptsMax = options.attemptsMax ?? 10;
	let attempt = 0;

	/**
	 * @type {undefined | ExecUntilResult}
	 */
	let previous;

	while (attempt < attemptsMax) {
		const state = /** @type {ExecUntilState} */({
			attempt,
			previous,
		});

		const commandString = typeof command === `string`
			? command
			: command({ attempt, previous });

		const output = await tryCatch(() => execAsync(commandString, options));

		const result = output instanceof Error
			? {
				error: output,
				stderr: ``,
				stdout: ``,
			}
			: output;

		const stateResult = {
			...state,
			result,
		};

		if (endCondition(stateResult)) {
			return result;
		}

		previous = result;
		attempt += 1;
	}

	throw new Error(`End condition wasn't met in ${attemptsMax} attempts`);
}

/**
 * Run command until it gives the same stdout/stderr or error twice in a row.
 * Useful when running commands that require multiple "passes", e.g. some linter auto-fixes.
 * @param {Parameters<typeof execUntil>[0]} command
 * @param {Parameters<typeof execUntil>[2]} [options]
 * @returns {Promise<ExecUntilResult>}
 */
export async function execUntilSame(command, options) {
	return execUntil(
		command,
		({ previous, result }) =>
			(
				result.error === undefined
				&& previous?.error === undefined
				&& result.stdout === previous?.stdout
				&& result.stderr === previous?.stderr
			)
			|| result.error?.message === previous?.error?.message,
		options,
	);
}
