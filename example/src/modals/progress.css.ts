import { css } from '@robertakarobin/util/string/template.ts';

export default css`
:host {
	& circle {
		stroke: #ff0000;
		transition: stroke-dasharray 10s;
	}
}
`;
