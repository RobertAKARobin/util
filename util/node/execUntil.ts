import { execSync } from 'child_process';

import { tryCatch } from '../tryCatch.ts';

/**
 * Run command until the same stdout is output twice
 * Useful when running commands that require multiple "passes", e.g. some linter auto-fixes
 */
export function execUntil(
	command: string,
	options: {
		attemptsMax?: number;
	} = {}
) {
	const attemptsMax = options.attemptsMax ?? 10;

	let attemptCount = 0;
	let previousAttemptReport = ``;
	while (attemptCount < attemptsMax) {
		console.log(`Attempt #${attemptCount + 1}:\t\`${command}\`...`);

		const result = tryCatch(() => execSync(command, { encoding: `utf8`, stdio: `pipe` }));

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

