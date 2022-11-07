import type { Device, Accessory, NumberTypes, Service } from './boundaries'
import { isType } from './std'
import { NUMBER_TYPES } from './boundaries'

import { Services } from './hap'

export class Metric {
    constructor(
        public readonly name: string,
        public readonly value: number,
        public readonly type: NumberTypes,
        public readonly labels: Record<string, string>,
    ) {}
}

/**
 * Characteristics that would be nonsensical to report as metrics
 */
const METRICS_FILTER = ['Identifier']

function debug(devices: Device[]): void {
    const debugInfo = []

    for (const device of devices) {
        for (const accessory of device.accessories.accessories) {
            for (const service of accessory.services) {
                const info = []
                for (const characteristic of service.characteristics) {
                    info.push(
                        [characteristic.description, 'value' in characteristic ? characteristic.value : '<none>'].join(
                            ': ',
                        ),
                    )
                }
                debugInfo.push(['Service ' + Services[service.type as keyof typeof Services], info])
            }
        }
    }

    console.log(JSON.stringify(debugInfo, null, 4))
}

export function aggregate(devices: Device[]): Metric[] {
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
                    for (const numberType of NUMBER_TYPES) {
                        if (characteristic.format === numberType && typeof characteristic.value !== 'undefined') {
                            if (METRICS_FILTER.includes(characteristic.description)) {
                                continue
                            }
                            const name = formatName(
                                Services[service.type as keyof typeof Services],
                                characteristic.description,
                                characteristic.unit,
                            )
                            if (!METRICS_FILTER.includes(name)) {
                                metrics.push(new Metric(name, characteristic.value, characteristic.format, labels))
                            }
                        }
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
