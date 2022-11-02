const ts = require(`typescript`);

const tsExtension = /\.ts$/;
module.exports = {
	resolveModuleNames: (
		moduleNames,
		containingFile,
		reusedNames,
		redirectedReference,
		options
	) => moduleNames.map((moduleName) =>
		ts.resolveModuleName(
			moduleName.replace(tsExtension, ``),
			containingFile,
			options,
			ts.sys
		).resolvedModule
	),
};
