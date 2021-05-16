const files = require('./files');
const util = require('./util');
const convert = require('./convertion');

function createClass(classData, pathToExtensionRoot) {
    const headerTemplate = files.readFile(`${pathToExtensionRoot}/templates/class.h`).toString();
    const sourceTemplate = files.readFile(`${pathToExtensionRoot}/templates/class.cpp`).toString();

    const projectData = util.loadProjectData();

    if (!projectData) {
        return;
    }

    const headerName = convert.toCase(classData.name, projectData.codeCase);
    const headerFormat = projectData.formats.header;
    const fullHeaderName = `${headerName}.${headerFormat}`;

    const sourceName = headerName;
    const sourceFormat = projectData.formats.source;
    const fullSourceName = `${sourceName}.${sourceFormat}`;

    const path = classData.where ? classData.where.replace(util.workspace(), '') : projectData.dirs.src;

    files.createFile(`${path}/${fullHeaderName}`, 
        headerTemplate, [
            { name: 'PARAM_CPPROJ_CLASS_NAME', value: classData.name }
        ]
    );

    files.createFile(`${path}/${fullSourceName}`,
        sourceTemplate, [
            { name: 'PARAM_CPPROJ_CLASS_NAME', value: classData.name },
            { name: 'PARAM_CPPROJ_FILE_NAME', value: fullHeaderName }
        ]
    );

}

module.exports = {
    createClass
};