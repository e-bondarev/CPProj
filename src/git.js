const terminal = require('./terminal');

function addSubmodule(url, name, workspace) {    
    terminal.execute(`git submodule add ${url} ${name}`, workspace);
}

module.exports = {
    addSubmodule
};