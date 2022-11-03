const ts = require(`typescript`);

const tsExtension = /\.ts$/;
module.exports = {
	resolveModuleNames: (
		moduleNames,
		containingFile,
		reusedNames,
		redirectedReference,
		options
	) => moduleNames.map((moduleName) => {
		if (moduleName.startsWith(`http`)) {
			return undefined;
		}
		return ts.resolveModuleName(
			moduleName.replace(tsExtension, ``),
			containingFile,
			options,
			ts.sys
		).resolvedModule;
	}),
};
