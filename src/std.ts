interface TypeMap {
    string: string
    number: number
    bigint: bigint
    boolean: boolean
    object: object
    symbol: symbol
    undefined: undefined
}

// Type predicate higher order function for use with e.g. filter or map
export function isType<T extends keyof TypeMap>(type: T): (v: unknown) => v is TypeMap[T] {
    return (v: unknown): v is TypeMap[T] => typeof v === type
}

// Type predicate for object keys
// Only safe for const objects, as other objects might carry additional, undeclared properties
export function isKeyOfConstObject<T extends object>(key: string | number | symbol, obj: T): key is keyof T {
    return key in obj
}

// Use for exhaustiveness checks in switch/case
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

export type DeepReadonly<T> = T extends (infer R)[]
    ? DeepReadonlyArray<R>
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Function
    ? T
    : T extends object
    ? DeepReadonlyObject<T>
    : T

export type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type Writable<T> = {
    -readonly [P in keyof T]: T[P]
}
