export const constants = {
	'aspect': 1080 / 1920,
	'font--base__family': `Georgia, serif`,
	'font--base__size': 16,
} as const;

export const vars = (constant: keyof typeof constants): string => `var(--${constant})`;
