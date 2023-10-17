import { FunctionCache } from '@robertakarobin/component';

const { call } = new FunctionCache(`foo`);

function log(event: UIEvent, name: string): void {
	console.log(event);
	console.log((event.currentTarget as HTMLElement).innerHTML);
	console.log(`Hello ${name}`);
}

export const template = () => `
<div>
	<button onclick="${call(log, `Steve`)}">Click me</button>
</div>
`;
