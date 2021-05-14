const { exec } = require('child_process');

function execute(cmd, workspace) {
    return exec(cmd, { cwd: workspace }, (err, out) => {
        if (err) {
            return reject(err);
        }

        return resolve(out);
    });
}

module.exports = {
    execute
};