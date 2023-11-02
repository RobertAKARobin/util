import type * as Type from '@robertakarobin/web';

const baseLayout: Type.PageLayout = input => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${input.title}</title>
		<script src="/web.js" type="module"></script>
		<script src="/script.js" type="module"></script>
		<link rel="stylesheet" href="/styles.css" />
	</head>
	<body>
		<div
			class="view"
			id="output"
		>${input.contents}</div>
	</body>
</html>
`;

export default baseLayout;
