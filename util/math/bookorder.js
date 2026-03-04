import { isPositiveInteger } from './isPositiveInteger.js';

/**
 * @typedef {number} BookOrderPage A Page represents a physical page in a book.
 * @typedef {Array<BookOrderPage>} BookOrderFold A Fold is 2 Pages that will appear as leaves on opposite halves of the Signature, represented by their page numbers.
 * @typedef {Array<BookOrderFold>} BookOrderSignature A Signature is 1 or more Folds, which will be folded and sewn together.
 * @typedef {Array<BookOrderSignature>} BookOrderBook A Book is 1 or more Signatures.
 * @typedef {{
 * foldsPerSignature?: number;
 * }} BookOrderOptions
 */

/**
 * Given a number of pages, returns the indexes of the pages arranged in printable order.
 * @param {number} pagesPerBook - Number of pages in the book.
 * @param {BookOrderOptions} [options_] - Defaults to one signature for the whole book.
 * @returns {BookOrderBook}
 */
export function bookOrder(pagesPerBook, options_ = {}) {
	const options = /** @satisfies {BookOrderOptions} */({
		...options_,
	});

	if (isPositiveInteger(pagesPerBook) === false) {
		throw new Error(`Number of pages must be positive integer; got ${pagesPerBook}`);
	}

	const pagesPerFold = 2; // TODO3: Is there any situation in which this should not be 2?
	const foldsPerBook = Math.ceil(pagesPerBook / pagesPerFold);
	options.foldsPerSignature ??= foldsPerBook;

	if (
		isPositiveInteger(options.foldsPerSignature) === false
		|| isPositiveInteger(pagesPerFold) === false
	) {
		throw new Error(`Options must be positive integers; got '${JSON.stringify(options)}'`);
	}

	const signaturesPerBook = Math.ceil(
		pagesPerBook
		/ options.foldsPerSignature
		/ pagesPerFold,
	);

	const pagesPerSignature = pagesPerFold * options.foldsPerSignature;
	const pageIndexHalfwayThroughSignature = (pagesPerSignature / 2);

	const book = /** @type {BookOrderBook} */([]);

	/** @type {BookOrderSignature} */ let signature;
	let signatureIndexInBook = 0;
	while (signatureIndexInBook < signaturesPerBook) {
		signature = [];
		book.push(signature);

		const pageIndexOfSignature = signatureIndexInBook * pagesPerSignature;

		let pageIndexInSignature = /** @type {BookOrderPage} */(0);
		while (pageIndexInSignature < pageIndexHalfwayThroughSignature) {
			signature.push([ // Array size is pagesPerFold
				pageIndexOfSignature + pageIndexInSignature,
				pageIndexOfSignature + pagesPerSignature - pageIndexInSignature - 1,
			]);

			pageIndexInSignature += 1;
		}

		signatureIndexInBook += 1;
	}

	return book;
}
