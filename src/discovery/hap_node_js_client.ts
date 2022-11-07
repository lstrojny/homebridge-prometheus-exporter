import type { HapDiscover } from './api'
import { HAPNodeJSClient } from 'hap-node-client'

import { Device, DeviceBoundary } from '../boundaries'
import { Array, Unknown } from 'runtypes'
import { Logger } from 'homebridge'

const MaybeDevices = Array(Unknown)

type HapConfig = {
    debug: boolean
    refresh: number
    timeout: number
    reqTimeout: number
    pin: string
}
type HapClient = typeof HAPNodeJSClient
type ResolveFunc = (devices: Device[]) => void
type RejectFunc = (error: unknown) => void

const clientMap: Record<string, HapClient> = {}
const promiseMap: Record<string, [ResolveFunc, RejectFunc]> = {}

function startDiscovery(logger: Logger, config: HapConfig, resolve: ResolveFunc, reject: RejectFunc) {
    const key = JSON.stringify(config)

    if (!clientMap[key]) {
        logger.debug('Creating new HAP client')
        const client = new HAPNodeJSClient(config)
        client.on('Ready', (deviceData: unknown) => {
            try {
                const devices: Device[] = []

                for (const device of MaybeDevices.check(deviceData)) {
                    try {
                        devices.push(DeviceBoundary.check(device))
                    } catch (e) {
                        logger.error('Boundary check for device data failed %o %s', e, JSON.stringify(device, null, 4))
                    }
                }

                if (promiseMap[key]) promiseMap[key][0](devices)
            } catch (e) {
                if (promiseMap[key]) promiseMap[key][1](e)
            }
        })
        clientMap[key] = client
    } else {
        logger.debug('Reusing existing HAP client')
    }
    promiseMap[key] = [resolve, reject]
}

export const discover: HapDiscover = ({ pin, refreshInterval, discoveryTimeout, requestTimeout, logger, debug }) => {
    return new Promise((resolve, reject) => {
        startDiscovery(
            logger,
            {
                debug: debug,
                refresh: refreshInterval,
                timeout: discoveryTimeout,
                reqTimeout: requestTimeout,
                pin,
            },
            resolve,
            reject,
        )
    })
}
