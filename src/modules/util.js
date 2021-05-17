const files = require('./files');
const vscode = require('vscode');

function workspace() {
	return vscode.workspace.workspaceFolders[0].uri.fsPath;
}

function configPath() {
	return `${workspace()}/.cpproj.json`;
}

function loadProjectData() {
	if (files.entityExists(configPath())) {
		const configFileContent = files.readFile(configPath()).toString();
		return JSON.parse(configFileContent);
	}

	return undefined;
}

function indexObject(obj, keySequence) {
    const levels = keySequence.split('.');
    var currentObject = obj;
    
    for (let i = 0; i < levels.length; i++) {
        currentObject = currentObject[levels[i]];
    }
    
    return currentObject;
}

module.exports = {
    workspace,
    configPath,
    loadProjectData,
	indexObject
};