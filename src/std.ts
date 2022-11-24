interface TypeMap {
    string: string
    number: number
    bigint: bigint
    boolean: boolean
    object: object
    symbol: symbol
    undefined: undefined
}

export function isType<T extends keyof TypeMap>(type: T): (v: unknown) => v is TypeMap[T] {
    return (v: unknown): v is TypeMap[T] => typeof v === type
}

export function assertTypeExhausted(v: never): never {
    throw new Error(`Type should be exhausted but is not. Value "${JSON.stringify(v)}`)
}

export function strCamelCaseToSnakeCase(str: string): string {
    return str
        .replace(/\B([A-Z][a-z])/g, ' $1')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
}

export function strReverse(str: string): string {
    return str.split('').reverse().join('')
}

export function strTrimRight(str: string, char: string): string {
    return strReverse(strReverse(str).replace(new RegExp(`^[${char}]+`), ''))
}
