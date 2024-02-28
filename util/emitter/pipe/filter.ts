import { IGNORE, type OnEmit } from '../emitter.ts';

export function filter<State>(
	filter: (updated: State, previous: State) => boolean
): OnEmit<State> {
	return function(update: State, { previous }: { previous: State; }) {
		if (filter(update, previous)) {
			return update;
		}

		return IGNORE as unknown as State;
	};
}
