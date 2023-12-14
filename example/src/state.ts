import { EntityStateEmitter } from '@robertakarobin/util/entities.ts';
import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';

import type * as Type from '@src/types.d.ts';

export const state = new EntityStateEmitter<Type.ListItem>();
state.add({
	value: `hello`,
});

export const modalContainer = new ModalContainer(`modals`);
