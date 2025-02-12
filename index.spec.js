import { cliArgs } from './util/node/cliArgs.js';
import { print } from './util/spec/index.js';
import { specRunNative } from './util/spec/src/runner.native.js';
import { specRunWeb } from './util/spec/src/runner.web.js';

/** @typedef {{ platform: string; verbose: string }} args */
const [args, ...targetFiles] = /** @type {typeof cliArgs<args>} */(cliArgs)(process.argv.slice(2));

const filenames = targetFiles.sort();

const runner = args.platform === `web` ? specRunWeb : specRunNative;
const rootResult = await runner(filenames, {
	timing: `consecutive`, // `concurrent` causes timing issues, e.g. blocking FPSLoop until another test completes which throws off FPSLoop's timers
});

const basedir = `file://` + process.cwd();
print(rootResult, {
	format: (result, text) => {
		if (args.verbose) {
			return text;
		}

		if (result.type === `suite` || result.type === `test`) {
			if (typeof text[0] === `string`) {
				text[0] = text[0].replace(basedir, ``);
			}
		}

		if (rootResult.status === `pass`) {
			if (result.type === `suite` || result.type === `test`) {
				return text;
			}

			return [``];
		}

		if (`status` in result && result.status === `fail`) {
			return text;
		}

		return [``];
	},
	verbose: true,
});

if (rootResult.status === `fail`) {
	process.exit(1);
}

process.exit(0);
