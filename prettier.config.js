module.exports = {
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    printWidth: 120,
    trailingComma: 'all',
    quoteProps: 'as-needed',
    proseWrap: 'always',
    overrides: [
        {
            files: ['tsconfig.json'],
            options: {
                parser: 'jsonc',
            },
        },
    ],
}
