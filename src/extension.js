const vscode = require('vscode');

const webviewAssembler = require('./webviewAssembler');
const structure = require('./structure');
const files = require('./files');

function workspace() {
	return vscode.workspace.workspaceFolders[0].uri.fsPath;
}

function configPath() {
	return `${workspace()}/.cpproj.json`;
}

function getDefaultProjectData() {
	return {
		name: 'CPProj-Project',
		version: '0.0.1',
		type: 'Application',
		appOrLibName: 'Application',
		dirs: {
			external: 'External',
			src: 'Source',
			build: 'Build',
		},
		codeCase: 'pascal',
		pch: 'pch',
		formats: {
			source: 'cpp',
			header: 'h'
		},
		submodules: []
	}
}

function openPanel(context, pathToExtensionRoot, htmlFile) {
	let projectData = getDefaultProjectData();

	if (files.entityExists(configPath())) {
		const configFileContent = files.readFile(configPath()).toString();
		projectData = JSON.parse(configFileContent);
	}

	const panel = vscode.window.createWebviewPanel(
		'cpproj',
		'CPProj',
		vscode.ViewColumn.One,
		{
			enableScripts: true
		}
	);

	panel.webview.postMessage({
		command: 'loadProjectData',
		projectData
	});

	panel.webview.onDidReceiveMessage(
		async message => {
			switch (message.command) {
				case 'createStructure':
					await structure.create(message.projectData, pathToExtensionRoot);
					return;
				case 'requireProjectData':
					panel.webview.postMessage({
						command: 'loadProjectData',
						projectData
					});
					break;
			}
		},
		undefined,
		context.subscriptions
	);

	panel.webview.html = htmlFile;
}

function activate(context) {
	const pathToExtensionRoot = context.extensionPath;

	const htmlFile = webviewAssembler.fromDir(
		`${pathToExtensionRoot}/layout`,
		'index.html',
		'main.js',
		'style.css', [
		'external/vue.js'
	]);

	openPanel(context, pathToExtensionRoot, htmlFile);	

	context.subscriptions.push(vscode.commands.registerCommand('cpproj.start', function () {
		openPanel(context, pathToExtensionRoot, htmlFile);
	}));
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
