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
