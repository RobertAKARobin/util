import { type FunctionCache } from '../../src/function-cache.ts';

export const template = (cache: FunctionCache) => `
<div>
	<button onclick="${cache.call(log, `Steve`)}">Click me</button>
</div>
`;

function log(event: UIEvent, name: string): void {
	console.log(event);
	console.log((event.currentTarget as HTMLElement).innerHTML);
	console.log(`Hello ${name}`);
}
