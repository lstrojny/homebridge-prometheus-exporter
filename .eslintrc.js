module.exports = {
    extends: ['eslint:recommended', 'plugin:import/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'import'],
    root: true,
    rules: {
        'prettier/prettier': 'warn',
        'prefer-arrow-callback': 'error',
        'sort-imports': [
            'error',
            {
                ignoreDeclarationSort: true,
            },
        ],
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': 'error',
        'import/first': 'error',
        'import/no-duplicates': 'error',
        'import/no-default-export': 'error',
        'import/no-namespace': 'error',
        'import/no-useless-path-segments': 'error',
    },
    overrides: [
        {
            files: ['**/*.ts'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:import/typescript',
            ],
            parserOptions: {
                project: ['./tsconfig.json'],
            },
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'error',
            },
            settings: {
                'import/resolver': {
                    typescript: {
                        project: './',
                    },
                },
            },
        },
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
