type Types = 'string' | 'number' | 'boolean' | 'object'
interface TypeMap {
    string: string
    number: number
    boolean: boolean
    object: object
}

export function isType<T extends Types>(type: T): (v: unknown) => v is TypeMap[T] {
    return (v: unknown): v is TypeMap[T] => typeof v === type
}

export function assertTypeExhausted(v: never): never {
    throw new Error(`Type should be exhausted but is not. Value "${JSON.stringify(v)}`)
}
