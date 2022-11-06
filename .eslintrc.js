module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    root: true,
    rules: {
        'prettier/prettier': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        'prefer-arrow-callback': 'error',
    },
    overrides: [
        {
            files: ['.eslintrc.js', 'jest.config.js', 'prettier.config.js'],
            env: {
                node: true,
                browser: false,
            },
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
}
