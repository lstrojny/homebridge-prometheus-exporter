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
        'import/no-named-as-default': 0,
        'no-duplicate-imports': 'error',
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
                '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
                '@typescript-eslint/consistent-type-exports': [
                    'error',
                    { fixMixedExportsWithInlineTypeSpecifier: false },
                ],
                '@typescript-eslint/prefer-readonly': 'error',
                '@typescript-eslint/prefer-readonly-parameter-types': 'error',
                '@typescript-eslint/switch-exhaustiveness-check': 'error',
                '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
                '@typescript-eslint/ban-types': ['error', { types: { undefined: 'Use null instead' } }],
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
            files: ['**/*.js'],
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
