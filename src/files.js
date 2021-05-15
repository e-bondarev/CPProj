const vscode = require('vscode');

const fs = require('fs');

const deleteIfExists = function(path) {
    const fileExists = fs.existsSync(path);

    if (fileExists) {
        try {
            fs.unlinkSync(path)
        } catch (err) {
            console.error(err)
        }
    }
}

const createDir = function(path) {
    const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = wsPath + '/' + path;

    const dirExists = fs.existsSync(filePath);

    if (dirExists) return;

    fs.mkdirSync(filePath);
}

const createFile = function(path, content, params = []) {
    const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = wsPath + '/' + path;
    
    deleteIfExists(filePath);

    for (var i = 0; i < params.length; i++) {
        content = content.replaceAll(params[i].name, params[i].value);
    }

    fs.appendFileSync(filePath, content);
}

const readFile = function(path) {
    return fs.readFileSync(path);
}

module.exports = {
    deleteIfExists,
    createDir,
    createFile,
    readFile
};