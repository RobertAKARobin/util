import { bounce } from '@robertakarobin/util/util/css/bounce';
import { css } from '@robertakarobin/util/util/components/component';
import { keyframesMulti } from '@robertakarobin/util/util/css/keyframes';

const bouncer = keyframesMulti(
	...bounce({
		bounciness: .6,
	}),
	1, { bounce: `bottom: 0` },
);

export default css`
:host {
	._bounce {
		animation: bounce ${bouncer.bounce.timeDuration}s infinite;
		aspect-ratio: 1;
		background: red;
		border-radius: 50%;
		display: block;
		position: relative;
		width: 100px;
	}
}

${bouncer}
`;
