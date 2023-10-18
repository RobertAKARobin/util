export const constants = {
	'font--base__family': `Georgia, serif`,
	'font--base__size': 16,
} as const;

export const vars = (constant: keyof typeof constants): string => `var(--${constant})`;
