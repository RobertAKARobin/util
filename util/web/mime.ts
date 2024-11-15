/**
 * Totally non-comprehensive list of MIME types that I'm using because I don't want to import the big honking list of actual MIME types
 */
export const mimeMap = { // https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
	css: `text/css`,
	csv: `text/csv`,
	gif: `image/gif`,
	htm: `text/html`,
	html: `text/html`,
	jpeg: `image/jpeg`,
	jpg: `image/jpeg`,
	js: `text/javascript`,
	json: `application/json`,
	otf: `font/otf`,
	png: `image/png`,
	svg: `image/svg+xml`,
	ttf: `font/ttf`,
	txt: `text/plain`,
	woff: `font/woff`,
	woff2: `font/woff2`,
	xml: `application/xml`,
};

export type MimeMapType = keyof typeof mimeMap;

/**
 * Returns the MIME type for the given filename, or an empty string
 */
export function mimeFor(filename: string, fallback = ``) {
	const extension = filename.split(`.`).pop() as MimeMapType;
	return mimeMap[extension] || fallback;
};
