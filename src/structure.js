const vscode = require('vscode');

const files = require('./files');
const git = require('./git');

const {
	camelCase,
	pascalCase,
	snakeCase
} = require('change-case');

const convertion = {
	camel: camelCase,
	pascal: pascalCase,
	snake: snakeCase
};

const defaultStructure = [
	{ 
		template: 'templates/src/main.cpp',
		path: '[dirs.src]/main.[formats.source]'
	},
	{ 
		template: 'templates/src/pch.h',
		path: '[dirs.src]/pch.[formats.header]'
	},
	{ 
		template: 'templates/CMakeLists.txt',
		path: 'CMakeLists.txt',
		keepCase: true,
		params: {
			PARAM_PROJECTOR_PROJECT_NAME:    proj => proj.name,
			PARAM_PROJECTOR_PROJECT_VERSION: proj => proj.version,

			PARAM_PROJECTOR_APP_NAME:        proj => proj.appOrLibName,

			PARAM_PROJECTOR_SRC_DIR_NAME:    proj => convertion[proj.codeCase](proj.dirs.src),
			PARAM_PROJECTOR_PCH_NAME:		 proj => `${convertion[proj.codeCase](proj.pch)}.${proj.formats.header}`,
			PARAM_PROJECTOR_SOURCE_FORMAT: 	 proj => proj.formats.source
		}
	},
	{
		template: 'templates/.gitignore',
		path: '.gitignore'
	},
	{
		path: '[dirs.build]'
	},
	{
		path: '[dirs.external]'
	}
];

function loadTemplate(pathToTemplate) {
	console.log(pathToTemplate);
	const content = files.readFile(pathToTemplate).toString();
	return content;
}

function getTokens(string) {
	const openBracketIndices = [];
	const closeBracketIndices = [];
	for (let i = 0; i < string.length; i++) {
		if (string[i] == '[') openBracketIndices.push(i);
		if (string[i] == ']') closeBracketIndices.push(i);
	}

	const tokens = [];

	for (let i = 0; i < openBracketIndices.length; i++) {
		const token = string.substring(openBracketIndices[i] + 1, closeBracketIndices[i]);
		tokens.push(token);
	}

	return tokens;
}

function index(obj, string) {
    const levels = string.split('.');
    var currentObject = obj;
    
    for (let i = 0; i < levels.length; i++) {
        currentObject = currentObject[levels[i]];
    }
    
    return currentObject;
}

function processString(string, projectData) {
	const tokens = getTokens(string);

	for (let i = 0; i < tokens.length; i++) {
		string = string.replaceAll(`[${tokens[i]}]`, index(projectData, tokens[i]));
	}
	
	return string;
}

function createStructure(structure, pathToExtensionRoot, projectData) {
	for (var i = 0; i < structure.length; i++) {
		const path = structure[i].path.split('/');

		for (let j = 0; j < path.length; j++) {
			path[j] = processString(path[j], projectData);
		}

		var depth = '';

		for (let j = 0; j < path.length; j++) {
			const isFile = path[j].includes('.');

			if (!isFile) {
				let finalDirName = path[j];

				if (!structure[i].keepCase) {
					finalDirName = convertion[projectData.codeCase](path[j]);
				}

				files.createDir(`${depth}${finalDirName}`);
				depth += `${finalDirName}/`;
			} else {
				const template = loadTemplate(`${pathToExtensionRoot}/${structure[i].template}`);

				const params = [];

				if (structure[i].params) {
					const keys = Object.keys(structure[i].params);
					for (let l = 0; l < keys.length; l++) {
						const name = keys[l];
						const value = structure[i].params[name](projectData);
						params.push({ name, value });
					}
				}

				let finalFileName = path[j];

				if (!structure[i].keepCase) {
					const splitFileName = path[j].split('.');
					const rawFileName = splitFileName[0];
					const format = splitFileName[1];
					finalFileName = `${convertion[projectData.codeCase](rawFileName)}.${format}`;
				}

				files.createFile(`${depth}${finalFileName}`, template, params);
			}
		}
	}
}

async function addSubmodules(workspace, submodules, externalDir) {
	for (var i = 0; i < submodules.length; i++)
	{
		if (!!submodules[i].url && !!submodules[i].name)		
			await git.addSubmodule(submodules[i].url, `${externalDir}/${submodules[i].name}`, workspace);
	}
}

function createConfig(projectData) {
	files.createFile('.cpproj.json', JSON.stringify(projectData, null, 2));
}

function addSubmodulesInCMakeLists(workspace, projectData) {
	let currentCMakeFile = files.readFile(`${workspace}/CMakeLists.txt`).toString();

	for (let i = 0; i < projectData.submodules.length; i++) {
		const pathToCMakeLists = projectData.submodules[i].cmake ? `/${projectData.submodules[i].cmake}` : '';
		const pathToInclude = projectData.submodules[i].include ? `/${projectData.submodules[i].include}` : '';
		currentCMakeFile += '\n\n';
		currentCMakeFile += `add_subdirectory(${projectData.dirs.external}/${projectData.submodules[i].name}${pathToCMakeLists})\n`;
		currentCMakeFile += `target_link_libraries(\${PROJECTOR_APP_NAME} ${projectData.submodules[i].lib})\n`;
		currentCMakeFile += `target_include_directories(\${PROJECTOR_APP_NAME} PUBLIC ${projectData.dirs.external}/${projectData.submodules[i].name}${pathToInclude})`;
	}

	files.createFile(`CMakeLists.txt`, currentCMakeFile);
}

async function create(projectData, pathToExtensionRoot) {
	const workspace = vscode.workspace.workspaceFolders[0].uri.fsPath;

	createStructure(defaultStructure, pathToExtensionRoot, projectData);
	createConfig(projectData);
	await addSubmodules(workspace, projectData.submodules, projectData.dirs.external);

	// projectData.submodules = [
	// 	{
	// 		name: 'glfw',
	// 		cmake: '',
	// 		lib: 'glfw',
	// 		include: 'include',
	// 	},
	// 	{
	// 		name: 'glew',
	// 		cmake: 'build/cmake',
	// 		lib: 'glew_s',
	// 		include: 'include'
	// 	}
	// ];

	addSubmodulesInCMakeLists(workspace, projectData);
}

module.exports = {
    create
};