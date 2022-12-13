declare module 'hap-node-client' {
    // eslint-disable-next-line @typescript-eslint/ban-types
    type HAPNodeJSClientConfig = Readonly<{
        debug?: boolean
        refresh?: number
        timeout?: number
        reqTimeout?: number
        pin?: string
    }>

    class HAPNodeJSClient {
        public constructor(config: HAPNodeJSClientConfig)

        public on(event: 'Ready', callback: (v: unknown) => void): void
    }
}

// Workaround for "node_modules/hap-nodejs/dist/lib/Advertiser.d.ts:5:29 - error TS7016: Could not find a declaration file for module '@homebridge/dbus-native'. '…/node_modules/@homebridge/dbus-native/index.js' implicitly has an 'any' type."
declare module '@homebridge/dbus-native' {
    type InvokeError = unknown
}
