import { type FunctionCache } from '../../../src/function-cache.ts';

export const template = ({ call }: FunctionCache) => `
<div>
	<button onclick="${call(log, `Dave`)}">Click me</button>
</div>
`;

function log(event: MouseEvent, name: string): void {
	console.log(event);
	console.log((event.currentTarget as HTMLElement).innerHTML);
	console.log(`Hello ${name}`);
}
