const vscode = require('vscode');

const fs = require('fs');

const deleteIfExists = async function(path) {
    const fileExists = await fs.existsSync(path);

    if (fileExists) {
        try {
            fs.unlinkSync(path)
        } catch (err) {
            console.error(err)
        }
    }
}

const createDir = async function(path) {    
    const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = wsPath + '/' + path;

    const dirExists = await fs.existsSync(filePath);

    if (dirExists) return;

    await fs.mkdirSync(filePath);
}

const createFile = async function(path, content, params = []) {
    const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = wsPath + '/' + path;
    
    await deleteIfExists(filePath);

    for (var i = 0; i < params.length; i++) {
        content = content.replaceAll(params[i].name, params[i].value);
    }

    fs.appendFile(filePath, content, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
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