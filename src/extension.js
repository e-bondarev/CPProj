const vscode = require('vscode');

const files = require('./files');
const templates = require('./templates');

function activate(context) {
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
					case 'createCmakeLists':
						console.log('Creating CMakeLists.txt..');
						files.createFile('CMakeLists.txt', templates.cmake);
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		panel.webview.html = getWebviewContent();
	}));
}

function getWebviewContent() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
	<button onclick="createCmakeLists()">
		Create CMakeLists.txt
	</button>
</body>
<script>
	const vscode = acquireVsCodeApi();

	function createCmakeLists()
	{
		vscode.postMessage({
			command: 'createCmakeLists'
		});
	}
</script>
</html>`;
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
