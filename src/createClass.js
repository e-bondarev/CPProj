const vscode = require('vscode');
const files = require('./files');
const util = require('./util');

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

function convert(string, codeCase) {
    return convertion[codeCase](string);
}

function createClass(classData, pathToExtensionRoot) {
    const headerTemplate = files.readFile(`${pathToExtensionRoot}/templates/class.h`).toString();
    const sourceTemplate = files.readFile(`${pathToExtensionRoot}/templates/class.cpp`).toString();

    const projectData = util.loadProjectData();

    if (!projectData) {
        return;
    }

    const headerName = convert(classData.name, projectData.codeCase);
    const headerFormat = projectData.formats.header;
    const fullHeaderName = `${headerName}.${headerFormat}`;

    const sourceName = headerName;
    const sourceFormat = projectData.formats.source;
    const fullSourceName = `${sourceName}.${sourceFormat}`;

    files.createFile(`${classData.where.replace(util.workspace(), '')}/${fullHeaderName}`, 
        headerTemplate, [
            { name: 'PARAM_CPPROJ_CLASS_NAME', value: classData.name }
        ]
    );

    files.createFile(`${classData.where.replace(util.workspace(), '')}/${fullSourceName}`,
        sourceTemplate, [
            { name: 'PARAM_CPPROJ_CLASS_NAME', value: classData.name },
            { name: 'PARAM_CPPROJ_FILE_NAME', value: fullHeaderName }
        ]
    );

}

module.exports = {
    createClass
};