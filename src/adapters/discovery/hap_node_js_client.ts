import type { HapDiscover } from './api'
import { HAPNodeJSClient } from 'hap-node-client'
import { type Device, DeviceBoundary, checkBoundary } from '../../boundaries'
import type { Logger } from 'homebridge'
import z from 'zod'

const MaybeDevices = z.array(z.unknown())

interface HapConfig {
    debug: boolean
    refresh: number
    timeout: number
    reqTimeout: number
    pin: string
}
type ResolveFunc = (devices: Device[]) => void
type RejectFunc = (error: unknown) => void

const clientMap: Record<string, HAPNodeJSClient> = {}
const promiseMap: Record<string, [ResolveFunc, RejectFunc]> = {}

function startDiscovery(logger: Logger, config: HapConfig, resolve: ResolveFunc, reject: RejectFunc) {
    const key = JSON.stringify(config)

    if (!clientMap[key]) {
        logger.debug('Creating new HAP client')
        const client = new HAPNodeJSClient(config)
        client.on('Ready', (deviceData: unknown) => {
            try {
                const devices: Device[] = []

                for (const device of checkBoundary(MaybeDevices, deviceData)) {
                    try {
                        devices.push(checkBoundary(DeviceBoundary, device))
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
