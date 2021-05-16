const { camelCase, pascalCase, snakeCase } = require('change-case');

const convertion = { camel: camelCase, pascal: pascalCase, snake: snakeCase };

function toCase(string, codeCase) {
    return convertion[codeCase](string);
}

module.exports = {
    toCase
}