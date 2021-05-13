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

const createFile = async function(path, content = '') {
    const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath; // gets the path of the first workspace folder
    const filePath = wsPath + '/' + path;
    
    await deleteIfExists(filePath);

    fs.appendFile(filePath, content, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

module.exports = {
    deleteIfExists,    
    createFile
};