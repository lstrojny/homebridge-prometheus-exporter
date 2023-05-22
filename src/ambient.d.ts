declare module 'hap-node-client' {
    type HAPNodeJSClientConfig = {
        debug?: boolean
        refresh?: number
        timeout?: number
        reqTimeout?: number
        pin?: string
    }

    class HAPNodeJSClient {
        constructor(config: HAPNodeJSClientConfig)

        on(event: 'Ready', callback: (v: unknown) => void): void
    }
}

declare module 'array.prototype.group' {
    function shim(): void
}

interface Array<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group<U>(fn: (value: T, index: number, array: T[]) => U, thisArg?: any): { U: T[] }
}
