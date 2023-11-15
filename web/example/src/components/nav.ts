import { route } from '../app.ts';

export default () => `
	<ul>
		<li>${route(`error404`, `Go /404.html`)}</li>
		<li>${route(`home`, `Go /`)}</li>
		<li>${route(`ssgNo`, `Go /ssg/no/`)}</li>
		<li>${route(`ssgYes`, `Go /ssg/yes/`)}</li>
	</ul>
`;
