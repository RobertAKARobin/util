import { execSync } from 'child_process';
import fs from 'fs';
import postcss from 'postcss';
import postcssNested from 'postcss-nested';

/**
 * Compiles `.css.js` file to `.css`
 * @param {string} source - Path to source `.css.js` file, where the `default` export is a CSS string
 * @param {string} target - Path to target `.css` file
 * @param {Object} options
 * @param {boolean} options.format - Callback to run on the compiled CSS before it's written to file
 * @param {boolean} options.unnest - Whether to use PostCSS to un-nest nested CSS selectors for older browsers
 */
export async function cssJs(
	source,
	target,
	options = {}
) {
	const unnest = options.unnest ?? true;

	let css = (await import(source)).default;

	if (css === undefined) {
		throw new Error(`File '${source}' was empty`);
	}

	if (unnest) {
		css = await postcss([postcssNested]).process(css, {
			from: undefined,
		}).css;
	}

	if (options.format) {
		css = options.format(css);
	}

	fs.writeFileSync(target, css);

	execSync(`stylelint ${target} --fix`);
	execSync(`stylelint ${target} --fix`); // Misses a few things the first time
}
