const terminal = require('./terminal');

async function addSubmodule(url, name, workspace) {    
    await terminal.execute(`git submodule add ${url} ${name}`, workspace);
}

module.exports = {
    addSubmodule
};