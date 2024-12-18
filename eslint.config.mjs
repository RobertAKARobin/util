{
	"extends": [
		"@robertakarobin/eslint-config-ts"
	],
	"ignorePatterns": [
		"**/dist/*",
		"**/dist-golden/*",
		"**/node_modules/*",
		"**/tmp/*",
		"**/package-lock.json"
	],
	"root": true,
	"rules": {
		"no-restricted-imports": ["error", {
			"patterns": [
				{
					"group": ["util/*"],
					"message": "Paths to util break when this package is imported. Use relative paths instead."
				}
			]
		}]
	}
}
