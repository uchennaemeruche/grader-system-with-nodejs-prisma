/*eslint no-undef: "error"*/
/*eslint-env node*/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    modulePathIgnorePatterns: ['<rootDir>/dist/']
}
