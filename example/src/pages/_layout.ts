import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';

import { Nav } from '@src/components/nav.ts';

export const layout = (contents: string) => `
${Nav.get()}
${contents}
${ModalContainer.get()}
`;
