import { app, route } from '../app.ts';

export default () => `
	<ul>
		<li>${route(`error404`, `Go ${app.routes.error404}`)}</li>
		<li>${route(`home`, `Go ${app.routes.home}`)}</li>
		<li>${route(`homeJump1`, `Go ${app.routes.homeJump1}`)}</li>
		<li>${route(`homeJump2`, `Go ${app.routes.homeJump2}`)}</li>
		<li>${route(`ssgNo`, `Go ${app.routes.ssgNo}`)}</li>
		<li>${route(`ssgYes`, `Go ${app.routes.ssgYes}`)}</li>
		<li>${route(`ssgYesJump1`, `Go ${app.routes.ssgYesJump1}`)}</li>
		<li>${route(`ssgYesJump2`, `Go ${app.routes.ssgYesJump2}`)}</li>
	</ul>
`;
