const vscode = require('vscode');

const webviewAssembler = require('./webviewAssembler');
const structure = require('./structure');

function openPanel(context, pathToExtensionRoot, htmlFile) {
	const panel = vscode.window.createWebviewPanel(
		'cpproj',
		'CPProj',
		vscode.ViewColumn.One,
		{
			enableScripts: true
		}
	);

	panel.webview.onDidReceiveMessage(
		async message => {
			switch (message.command) {
				case 'createStructure':
					await structure.create(message.projectData, pathToExtensionRoot);
					return;
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
