const files = require('./files');
const git = require('./git');
const convert = require('./convertion');
const util = require('./util');

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
			PARAM_PROJECTOR_TYPE:        	 proj => proj.type == 'Application' ? 'executable' : 'library',

			PARAM_PROJECTOR_SRC_DIR_NAME:    proj => convert.toCase(proj.dirs.src, proj.codeCase),
			PARAM_PROJECTOR_PCH_NAME:		 proj => `${convert.toCase(proj.pch, proj.codeCase)}.${proj.formats.header}`,
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

function processString(string, projectData) {
	const tokens = getTokens(string);

	for (let i = 0; i < tokens.length; i++) {
		string = string.replaceAll(`[${tokens[i]}]`, util.indexObject(projectData, tokens[i]));
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
				const finalDirName = path[j];
				files.createDir(`${depth}${finalDirName}`);
				depth += `${finalDirName}/`;
			} else {
				const template = files.readFile(`${pathToExtensionRoot}/${structure[i].template}`).toString();
				let finalFileName = path[j];

				if (!structure[i].keepCase) {
					const splitFileName = path[j].split('.');
					const rawFileName = splitFileName[0];
					const format = splitFileName[1];
					finalFileName = `${convert.toCase(rawFileName, projectData.codeCase)}.${format}`;
				}

				files.createFile(`${depth}${finalFileName}`, template, structure[i].params, projectData);
			}
		}
	}
}

function validSubmodule(submodule) {
	return submodule.url && submodule.name && submodule.include;
}

function submoduleExists(pathToSubmodule) {
	return files.entityExists(pathToSubmodule);
}

async function addSubmodules(submodules, externalDir) {
	files.createFile('.gitmodules', '');

	for (let i = 0; i < submodules.length; i++) {
		if (validSubmodule(submodules[i]) && !submoduleExists(`${util.workspace()}/${externalDir}/${submodules[i].name}`)) {
			await git.addSubmodule(submodules[i].url, `${externalDir}/${submodules[i].name}`, util.workspace());
		}
	}
}

function createConfig(projectData) {
	files.createFile('.cpproj.json', JSON.stringify(projectData, null, 2));
}

function addSubmodulesInCMakeLists(projectData) {
	let currentCMakeFile = files.readFile(`${util.workspace()}/CMakeLists.txt`).toString();

	for (let i = 0; i < projectData.submodules.length; i++) {
		if (validSubmodule(projectData.submodules[i])) {
			const pathToCMakeLists = projectData.submodules[i].cmake ? `/${projectData.submodules[i].cmake}` : '';
			const pathToInclude = projectData.submodules[i].include ? `/${projectData.submodules[i].include}` : '';
			currentCMakeFile += '\n\n';
			currentCMakeFile += `add_subdirectory(${projectData.dirs.external}/${projectData.submodules[i].name}${pathToCMakeLists})\n`;
			currentCMakeFile += `target_include_directories(\${PROJECTOR_APP_NAME} PUBLIC ${projectData.dirs.external}/${projectData.submodules[i].name}${pathToInclude})`;
			if (projectData.submodules[i].lib.length) {
				currentCMakeFile += '\n';
				currentCMakeFile += `target_link_libraries(\${PROJECTOR_APP_NAME} ${projectData.submodules[i].lib})`;
			}
		}
	}

	files.createFile(`CMakeLists.txt`, currentCMakeFile);
}

async function create(projectData, pathToExtensionRoot) {
	createStructure(defaultStructure, pathToExtensionRoot, projectData);
	createConfig(projectData);
	await addSubmodules(projectData.submodules, projectData.dirs.external);
	addSubmodulesInCMakeLists(projectData);
}

module.exports = {
    create
};