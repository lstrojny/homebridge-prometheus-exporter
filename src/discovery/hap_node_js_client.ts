import type { HapDiscover } from './api'
import { HAPNodeJSClient } from 'hap-node-client'

import { Device, DeviceBoundary } from '../boundaries'
import { Array, Unknown } from 'runtypes'

const MaybeDevices = Array(Unknown)

export const discover: HapDiscover = ({ pin, refreshInterval, discoveryTimeout, requestTimeout, logger, debug }) => {
    return new Promise((resolve, reject) => {
        try {
            const client = new HAPNodeJSClient({
                debug: debug,
                refresh: refreshInterval,
                timeout: discoveryTimeout,
                reqTimeout: requestTimeout,
                pin,
            })

            client.on('Ready', (deviceData: unknown) => {
                try {
                    const devices: Device[] = []

                    for (const device of MaybeDevices.check(deviceData)) {
                        try {
                            devices.push(DeviceBoundary.check(device))
                        } catch (e) {
                            logger.error(
                                'Boundary check for device data failed %o %s',
                                e,
                                JSON.stringify(device, null, 4),
                            )
                        }
                    }

                    resolve(devices)
                } catch (e) {
                    reject(e)
                }
            })
        } catch (e) {
            reject(e)
        }
    })
}
