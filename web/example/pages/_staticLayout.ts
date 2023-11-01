export const staticLayout = (
	title: string,
	contents: string,
) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${title}</title>
		<script src="/web.js" type="module"></script>
		<script src="/script.js" type="module"></script>
		<link rel="stylesheet" href="/styles.css" />
	</head>
	<body>
		<div
			class="view"
			id="output"
		>${contents}</div>
	</body>
</html>
`;
