const vscode = require('vscode');

const files = require('./files');
const templates = require('./templates');
const webviewAssembler = require('./webviewAssembler');

function createStructure(projectData) {
	console.log('Creating structure..');
	
	files.createFile('CMakeLists.txt', templates.cmake, [
		{ name: 'PARAM_PROJECTOR_PROJECT_NAME', value: projectData.name },
		{ name: 'PARAM_PROJECTOR_APP_NAME', value: projectData.appOrLibName }
	]);

	files.createFile('.gitignore', templates.gitignore);

	files.createDir('src');
	files.createFile('src/main.cpp', templates.main);
	files.createFile('src/pch.h', templates.pch);

	console.log(projectData);
}

function activate(context) {
	const htmlFile = webviewAssembler.fromDir(
		`${context.extensionPath}/layout`,
		'index.html',
		'main.js',
		'style.css', [
			'external/vue.js'
		]
	);

	context.subscriptions.push(vscode.commands.registerCommand('catCoding.start', function () {
		const panel = vscode.window.createWebviewPanel(
			'catCoding',
			'Cat Coding',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);

		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'createStructure':
						createStructure(message.projectData);
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		panel.webview.html = htmlFile;
	}));
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
