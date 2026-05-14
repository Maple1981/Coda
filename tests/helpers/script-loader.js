const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createScriptLoader(root, context) {
	function runScript(relativePath) {
		const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
		vm.runInContext(source, context, { filename: relativePath });
	}

	function manifestScripts() {
		if (!context.window.CodaScriptManifest) {
			runScript('js/bootstrap/script-manifest.js');
		}

		return context.window.CodaScriptManifest.applicationScripts.slice();
	}

	function runManifestRange(firstScript, lastScript, options) {
		const scripts = manifestScripts();
		const firstIndex = scripts.indexOf(firstScript);
		const lastIndex = scripts.indexOf(lastScript);
		const excludes = (options && options.exclude) || [];

		if (firstIndex < 0) {
			throw new Error('No se encontró el script inicial en el manifest: ' + firstScript);
		}

		if (lastIndex < firstIndex) {
			throw new Error('No se encontró un rango válido hasta: ' + lastScript);
		}

		scripts.slice(firstIndex, lastIndex + 1).forEach(function (scriptPath) {
			if (excludes.indexOf(scriptPath) === -1) {
				runScript(scriptPath);
			}
		});
	}

	return {
		manifestScripts: manifestScripts,
		runManifestRange: runManifestRange,
		runScript: runScript
	};
}

module.exports = {
	createScriptLoader
};
