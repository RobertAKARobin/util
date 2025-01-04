import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssNested from 'postcss-nested';

/**
 * @callback cssFormatCallback
 * @param {string} css
 */

/**
 * Compiles `.css.js` file to `.css`
 * @param {string} source - Path to source `.css.js` file, where the `default` export is a CSS string
 * @param {string|undefined} target - Path to target `.css` file
 * @param {Object} options
 * @param {cssFormatCallback} [options.format=undefined] - Callback to run on the compiled CSS before it's written to file
 * @param {boolean} [options.unnest=true] - Whether to use PostCSS to un-nest nested CSS selectors for older browsers
 */
export async function cssJs(
	source,
	target = undefined,
	options = {},
) {
	const unnest = options.unnest ?? true;

	const sourceAbs = path.isAbsolute(source)
		? source
		: path.join(process.cwd(), source);

	let targetAbs = target ?? source.replace(/\.css\.(js|ts)$/, `.css`);
	targetAbs = path.isAbsolute(targetAbs)
		? targetAbs
		: path.join(process.cwd(), targetAbs);

	/** @type {string} */
	let css = (await import(sourceAbs)).default; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

	if (css === undefined) {
		throw new Error(`File '${source}' was empty`);
	}

	if (unnest) {
		css = postcss([postcssNested]).process(css, {
			from: undefined,
		}).css;
	}

	if (typeof options.format === `function`) {
		css = options.format(css); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
	}

	fs.writeFileSync(targetAbs, css);
}
