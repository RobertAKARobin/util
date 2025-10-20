/**
 * @typedef {[number, number, number, number]} BookOrderLeaf A leaf is one of the pieces of paper that makes up a book. A leaf usually comprises 4 pages.
 * @typedef {Array<BookOrderLeaf>} BookOrderSignature A book is a bunch of signatures stuck together. A signature is a stack of leaves and sewn together.
 * @typedef {{
 * leavesPerSignature?: number;
 * }} BookOrderOptions
 */

const pagesPerLeaf = 4;

/**
 * Given a number of pages, returns the indexes of the pages arranged in "leaves" of a book
 * @param {number} pagesLength
 * @param {BookOrderOptions} [options_]
 * @returns {Array<BookOrderLeaf>}
 */
export function bookOrder(pagesLength, options_ = {}) {
	const leaves = /** @type {Array<BookOrderLeaf>} */([]);

	const options = /** @satisfies {BookOrderOptions} */({
		leavesPerSignature: Math.ceil(pagesLength / pagesPerLeaf),
		...options_,
	});

	const signaturesLength = pagesLength / options.leavesPerSignature / pagesPerLeaf;
	const pagesPerSignature = pagesPerLeaf * options.leavesPerSignature;
	const pageIndexHalfwayThroughSignature = (pagesPerSignature / 2);

	let signatureIndex = 0;
	let pageIndexInSignature = 0;
	let pageIndexOffset = 0;

	while (true) {
		if (pageIndexInSignature >= pageIndexHalfwayThroughSignature) {
			signatureIndex += 1;

			if (signatureIndex >= signaturesLength) {
				break;
			}

			pageIndexInSignature = 0;
			pageIndexOffset = (signatureIndex * pagesPerSignature);
		}

		const leaf = /** @type {BookOrderLeaf} */([
			pageIndexOffset + pageIndexInSignature,
			pageIndexOffset + pagesPerSignature - pageIndexInSignature - 1,
			pageIndexOffset + pageIndexInSignature + 1,
			pageIndexOffset + pagesPerSignature - pageIndexInSignature - 1 - 1,
		]);

		leaves.push(leaf);

		pageIndexInSignature += 2;
	}

	return leaves;
}
