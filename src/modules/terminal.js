const { exec } = require('child_process');

async function execute(cmd, workspace) {
    return exec(cmd, { cwd: workspace }, (err, out) => {
        if (err) {
            return reject(err);
        }

        return resolve(out);
    });
}

function execShellCommand(cmd, workspace) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd: workspace }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

module.exports = {
    execute: execShellCommand
};