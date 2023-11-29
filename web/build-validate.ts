import { color } from '@robertakarobin/jsutil/colors.ts';
import { HtmlValidate } from 'html-validate';
import jsBeautify from 'js-beautify';
import stylelint from 'stylelint';

import { Builder } from '@robertakarobin/web/build.ts';

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const htmlValidate = new HtmlValidate();

/**
 * Adds HTML and CSS validation, pretty-printing the output, etc. Separate from the base Builder since it requires several peer dependencies.
 */
export class BuilderWithValidation extends Builder {
	hasErrors = false;

	stylelintConfig: stylelint.Config = {
		extends: `@robertakarobin/csslint`,
		rules: {
			"custom-property-empty-line-before": null,
			"custom-property-pattern": null,
			"declaration-empty-line-before": null,
		},
	};

	cleanup() {
		if (this.hasErrors) { // Throwing the error here so everything still compiles, if possible, which makes it easier to debug
			throw new Error(color(`Errors! See output above.`, `red`));
		}
	}

	async formatCss(contents: string) {
		let css = trimNewlines(contents);
		css = jsBeautify.css(css, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
		});
		const validation = await stylelint.lint({
			code: css,
			config: this.stylelintConfig,
		});
		if (validation.errored) {
			this.hasErrors = true;
			for (const result of validation.results) { // TODO2: Report parseErrors?
				result.deprecations.forEach(item => console.log(item.text));
				result.warnings.sort((a, b) => a.line - b.line).forEach(item => {
					console.log(`${color(`${item.line} ${item.rule}`, `yellow`)}\n\t${item.text}`);
				});
			}
		}
		return css;
	}

	async formatHtml(...[input]: Parameters<Builder[`formatHtml`]>) {
		let html = await super.formatHtml(input);
		html = trimNewlines(html);
		html = jsBeautify.html(html, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
			unformatted: [`script`],
		});
		const validation = htmlValidate.validateStringSync(html);
		if (!validation.valid) {
			this.hasErrors = true;
			console.log(JSON.stringify(validation.results[0].messages, null, `  `));
		}
		return html;
	}
}
