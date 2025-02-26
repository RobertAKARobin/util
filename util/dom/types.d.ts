import type { CustomDragEvent } from './makeDraggable';

export type ElAttributes<Subclass extends Element> = {
	[Key in keyof Subclass]: Subclass[Key] extends Function ? Function : number | string;
} & {
	class: string;
	style: string;
};

declare global {
	interface GlobalEventHandlersEventMap { // eslint-disable-line no-restricted-syntax
		customdrag: CustomDragEvent;
	}
}
