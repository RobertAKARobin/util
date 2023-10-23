import { bind, component, router } from '../index.ts';

export const routeTo = (event: Event, path: string) => {
	event.preventDefault();
	window.history.pushState({}, ``, path);
	router.next(path);
};

const template = (
	options: {
		to: string;
	},
	content: string
) => `
	<a
		href="${options.to}"
		onclick=${bind(routeTo, options.to)}
		>
		${content}
	</a>
`;

export const route = component({ template });
