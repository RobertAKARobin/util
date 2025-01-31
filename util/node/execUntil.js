import { execSync } from 'child_process';

import { tryCatch } from '../tryCatch';

/**
 * Run command until the same stdout is output twice
 * Useful when running commands that require multiple "passes", e.g. some linter auto-fixes
 * TODO1: Spec
 * @param {string} command
 * @param {object} [options]
 * @param {number} [options.attemptsMax=10]
 * @returns {Error | string}
 */
export function execUntil(command, options = {}) {
	const attemptsMax = options.attemptsMax ?? 10;

	let attemptCount = 0;
	let previousAttemptReport = ``;
	while (attemptCount < attemptsMax) {
		console.log(`Attempt #${attemptCount + 1}:\t\`${command}\`...`);

		const result = tryCatch(() => execSync(command, { encoding: `utf8`, stdio: `pipe` })); // TODO3: Async? Blocking due to sync can cause issues when processes are running concurrently, like FPSLoop spec

		if (result instanceof Error) {
			const attemptReport = result.toString();

			if (attemptReport === previousAttemptReport) {
				return result;
			}

			previousAttemptReport = attemptReport;
			attemptCount += 1;

		} else {
			return result;
		}
	}

	throw new Error(`Command didn't produce same result twice in ${attemptsMax} attempts`);
}

