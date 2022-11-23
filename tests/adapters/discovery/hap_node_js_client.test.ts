import { afterAll, describe, expect, jest, test } from '@jest/globals'
import { hapNodeJsClientDiscover as discover } from '../../../src/adapters/discovery/hap_node_js_client'

const intervals: NodeJS.Timer[] = []

let deviceData: unknown = null

jest.mock('hap-node-client', () => ({
    HAPNodeJSClient: class {
        on(event: string, fn: (data: unknown) => void) {
            intervals.push(setInterval(() => fn(deviceData), 100))
        }
    },
}))

const properDeviceData = {
    instance: {
        deviceID: 'bff926c2-ddbe-4141-b17f-f011e03e669c',
        name: 'name',
        url: 'http://bridge.local',
    },
    accessories: {
        accessories: [
            {
                services: [
                    {
                        type: 'SERVICE TYPE',
                        characteristics: [
                            {
                                format: 'bool',
                                value: 1,
                                description: 'description',
                                type: 'CHARACTERISTIC TYPE',
                            },
                        ],
                    },
                ],
            },
        ],
    },
}

const invalidDeviceData = {}

const config = {
    debug: false,
    pin: '123-12-123',
    refresh_interval: 10,
    discovery_timeout: 10,
    request_timeout: 10,
}

describe('HAP NodeJS Client', () => {
    afterAll(() => {
        intervals.map((timer) => clearInterval(timer))
    })

    test('Simple discovery', async () => {
        deviceData = [properDeviceData]
        expect(await discover({ config })).toHaveLength(1)
    })

    test('Connection pooling works', async () => {
        deviceData = [properDeviceData]
        expect(await discover({ config })).toHaveLength(1)

        expect(await discover({ config })).toHaveLength(1)
    })

    test('Invalid device data is ignored', async () => {
        deviceData = [invalidDeviceData, properDeviceData]
        expect(await discover({ config })).toHaveLength(1)
    })
})
