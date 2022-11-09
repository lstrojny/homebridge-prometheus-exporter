import type { Accessory, Device, Service } from './boundaries/hap'
import { assertTypeExhausted, isType } from './std'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Service as HapService } from 'hap-nodejs'

export class Metric {
    constructor(
        public readonly name: string,
        public readonly value: number,
        public readonly timestamp: Date | null = null,
        public readonly labels: Record<string, string> = {},
    ) {}
}

/**
 * Characteristics that would be nonsensical to report as metrics
 */
const METRICS_FILTER = ['Identifier']

export function aggregate(devices: Device[], timestamp: Date): Metric[] {
    const metrics: Metric[] = []

    for (const device of devices) {
        for (const accessory of device.accessories.accessories) {
            for (const service of accessory.services) {
                const labels = {
                    ...getDeviceLabels(device),
                    ...getAccessoryLabels(accessory),
                    ...getServiceLabels(service),
                }
                for (const characteristic of service.characteristics) {
                    const format = characteristic.format
                    switch (format) {
                        case 'string':
                        case 'tlv8':
                        case 'data':
                            break

                        case 'bool':
                        case 'float':
                        case 'int':
                        case 'uint8':
                        case 'uint16':
                        case 'uint32':
                        case 'uint64':
                            if (typeof characteristic.value !== 'undefined') {
                                if (METRICS_FILTER.includes(characteristic.description)) {
                                    break
                                }
                                const name = formatName(
                                    uuidToServerName(service.type),
                                    characteristic.description,
                                    characteristic.unit,
                                )
                                metrics.push(new Metric(name, characteristic.value, timestamp, labels))
                            }
                            break

                        default:
                            assertTypeExhausted(format)
                    }
                }
            }
        }
    }

    return metrics
}

export function formatName(serviceName: string, description: string, unit: string | undefined = undefined): string {
    return (
        [serviceName, description, typeof unit === 'string' ? unit.toLowerCase() : undefined]
            .filter(isType('string'))
            .map((v) => camelCaseToSnakeCase(v))
            // Remove duplicate prefix
            .reduce((carry, value) => (value.startsWith(carry) ? value : carry + '_' + value))
    )
}

function camelCaseToSnakeCase(str: string): string {
    return str
        .replace(/\B([A-Z][a-z])/g, ' $1')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
}

function getDeviceLabels(device: Device): Record<string, string> {
    return {
        bridge: device.instance.name,
        device_id: device.instance.deviceID,
    }
}

function getAccessoryLabels(accessory: Accessory): Record<string, string> {
    const labels: Record<string, string> = {}

    for (const service of accessory.services) {
        if (service.type === '0000003E-0000-1000-8000-0026BB765291') {
            return getServiceLabels(service)
        }
    }

    return labels
}

function getServiceLabels(service: Service): Record<string, string> {
    const labels: Record<string, string> = {}

    for (const characteristic of service.characteristics) {
        if (
            characteristic.format === 'string' &&
            [
                'Name',
                'Configured Name',
                'Model',
                'Manufacturer',
                'Serial Number',
                'Version',
                'Firmware Revision',
                'Hardware Revision',
            ].includes(characteristic.description)
        ) {
            labels[camelCaseToSnakeCase(characteristic.description)] = characteristic.value
        }
    }

    return labels
}

function uuidToServerName(uuid: string): string {
    for (const name of Object.getOwnPropertyNames(HapService)) {
        const maybeService = (HapService as unknown as Record<string, unknown>)[name]
        if (typeof maybeService === 'function' && 'UUID' in maybeService) {
            if ((maybeService as Record<string, string>)['UUID'] === uuid) {
                return name
            }
        }
    }
    throw new Error(`Could not resolve UUID ${uuid} to service`)
}
