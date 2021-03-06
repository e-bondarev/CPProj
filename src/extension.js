const vscode = require('vscode');

const webviewAssembler = require('./modules/webview-assembler');
const structure = require('./modules/structure');
const files = require('./modules/files');
const util = require('./modules/util');

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

	if (files.entityExists(util.configPath())) {
		const configFileContent = files.readFile(util.configPath()).toString();
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

function createClass(context, pathToExtensionRoot, htmlFile, e) {
	const panel = vscode.window.createWebviewPanel(
		'createClass',
		'Create class',
		vscode.ViewColumn.One,
		{
			enableScripts: true
		}
	);

	panel.webview.onDidReceiveMessage(
		async message => {
			switch (message.command) {
				case 'createClass':
					const { createClass } = require('./modules/create-class');
					message.classData.where = e ? e.fsPath : undefined;
					createClass(message.classData, pathToExtensionRoot);
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
		pathToExtensionRoot,
		'layouts/structure',
		'index.html',
		'main.js',
		'layouts/common-style.css',
		'style.css', 
		['external/vue.js']
	);

	const createClassHtml = webviewAssembler.fromDir(
		pathToExtensionRoot,
		'layouts/create-class',
		'index.html',
		'main.js',
		'layouts/common-style.css',
		'style.css', 
		['external/vue.js']
	);

	openPanel(context, pathToExtensionRoot, htmlFile);	

	context.subscriptions.push(vscode.commands.registerCommand('cpproj.start', function () {
		openPanel(context, pathToExtensionRoot, htmlFile);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('cpproj.createClass', e => {
		createClass(context, pathToExtensionRoot, createClassHtml, e);
	}));
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
