const vscode = require('vscode');

const files = require('./files');
const templates = require('./templates');
const webviewAssembler = require('./webviewAssembler');
const git = require('./git');

const {
	camelCase,
	pascalCase,
	snakeCase
} = require('change-case');

const names = {
	main: 'main',
	pch: 'pch',
};

const convertion = {
	pascal: pascalCase,
	camel: camelCase,
	snake: snakeCase
};

async function createStructure(projectData) {
	const mainName = convertion[projectData.codeCase](names.main) + '.cpp';
	const pchName = convertion[projectData.codeCase](names.pch) + '.h';

	files.createFile('CMakeLists.txt', templates.cmake, [
		{ name: 'PARAM_PROJECTOR_PROJECT_NAME', value: projectData.name },
		{ name: 'PARAM_PROJECTOR_PROJECT_VERSION', value: projectData.version },
		{ name: 'PARAM_PROJECTOR_APP_NAME', value: projectData.appOrLibName },
		{ name: 'PARAM_PROJECTOR_SRC_DIR_NAME', value: projectData.src },
		{ name: 'PARAM_PROJECTOR_PCH_NAME', value: pchName }
	]);

	const workspace = vscode.workspace.workspaceFolders[0].uri.fsPath;

	for (var i = 0; i < projectData.submodules.length; i++)
	{
		git.addSubmodule(projectData.submodules[i].url, `${projectData.external}/${projectData.submodules[i].name}`, workspace);
	}
	
	const cwd = '.';
	const command = `node -e "console.log('hi!');"`;

	const { code } = await TerminalWrapper.execInTerminal(cwd, command, {}).waitForResult();
	if (code) {
		const processExecMsg = `${cwd}$ ${command}`;
		throw new Error(`Process failed with exit code ${code} (${processExecMsg})`);
	}

	files.createFile('.gitignore', templates.gitignore);

	const srcDir = projectData.src;
	const buildDir = projectData.build;
	const externalDir = projectData.external;

	files.createDir(srcDir);
	files.createFile(`${srcDir}/${mainName}`, templates.main);
	files.createFile(`${srcDir}/${pchName}`, templates.pch);

	files.createDir(buildDir);
	files.createDir(externalDir);

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
