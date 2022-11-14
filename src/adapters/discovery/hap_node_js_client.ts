import type { HapDiscover } from './api'
import { HAPNodeJSClient, type HAPNodeJSClientConfig } from 'hap-node-client'
import { type Device, DeviceBoundary, checkBoundary } from '../../boundaries'
import type { Logger } from 'homebridge'
import z from 'zod'

const MaybeDevices = z.array(z.unknown())

type ResolveFunc = (devices: Device[]) => void
type RejectFunc = (error: unknown) => void

const clientMap: Record<string, HAPNodeJSClient> = {}
const promiseMap: Record<string, [ResolveFunc, RejectFunc]> = {}

function startDiscovery(logger: Logger, config: HAPNodeJSClientConfig, resolve: ResolveFunc, reject: RejectFunc) {
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

export const hapNodeJsClientDiscover: HapDiscover = ({ config, log }) => {
    return new Promise((resolve, reject) => {
        startDiscovery(
            log,
            {
                debug: config.debug,
                refresh: config.refresh_interval,
                timeout: config.discovery_timeout,
                reqTimeout: config.request_timeout,
                pin: config.pin,
            },
            resolve,
            reject,
        )
    })
}
