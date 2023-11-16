import { routes, routeTo } from '../router.ts';

export default () => `
	<ul>
		<li>${routeTo(`error404`, `Go ${routes.error404}`)}</li>
		<li>${routeTo(`home`, `Go ${routes.home}`)}</li>
		<li>${routeTo(`homeJump1`, `Go ${routes.homeJump1}`)}</li>
		<li>${routeTo(`homeJump2`, `Go ${routes.homeJump2}`)}</li>
		<li>${routeTo(`ssgNo`, `Go ${routes.ssgNo}`)}</li>
		<li>${routeTo(`ssgYes`, `Go ${routes.ssgYes}`)}</li>
		<li>${routeTo(`ssgYesJump1`, `Go ${routes.ssgYesJump1}`)}</li>
		<li>${routeTo(`ssgYesJump2`, `Go ${routes.ssgYesJump2}`)}</li>
	</ul>
`;
