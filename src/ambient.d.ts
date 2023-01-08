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

// Workaround for "node_modules/hap-nodejs/dist/lib/Advertiser.d.ts:5:29 - error TS7016: Could not find a declaration file for module '@homebridge/dbus-native'. '…/node_modules/@homebridge/dbus-native/index.js' implicitly has an 'any' type."
declare module '@homebridge/dbus-native' {
    type InvokeError = unknown
}

declare module 'array.prototype.group' {
    function shim(): void
}

interface Array<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group<U>(fn: (value: T, index: number, array: T[]) => U, thisArg?: any): { U: T[] }
}
