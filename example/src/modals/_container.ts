import { appContext } from '@robertakarobin/util/context.ts';
import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';

export const modalContainer = appContext === `build`
	? new ModalContainer()
	: ModalContainer.find();
