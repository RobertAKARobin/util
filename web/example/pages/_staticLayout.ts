import pretty from 'pretty';

export const staticLayout = (
	title: string,
	contents: string,
) => pretty(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${title}</title>
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
`, { ocd: true });
