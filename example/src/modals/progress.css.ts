import { css } from '@robertakarobin/util/util/string/template';

export default css`
:host {
	& circle {
		stroke: #ff0000;
		transition: stroke-dasharray 10s;
	}
}
`;
