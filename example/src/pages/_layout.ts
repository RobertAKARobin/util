import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';

import { Nav } from '@src/components/nav.ts';

export const layout = (contents: string) => `
${new Nav()}
${contents}
${new ModalContainer()}
`;
