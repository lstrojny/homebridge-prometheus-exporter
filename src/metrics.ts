import type { Accessory, Device, Service } from './boundaries'
import { Services, Uuids } from './generated/services'
import {
    type Immutable,
    type ImmutableDate,
    type Mutable,
    assertTypeExhausted,
    isKeyOfConstObject,
    isType,
    strCamelCaseToSnakeCase,
} from './std'

type Labels = Immutable<Record<string, string>>

export class Metric {
    public constructor(
        public readonly name: string,
        public readonly value: number,
        public readonly timestamp: ImmutableDate | null = null,
        public readonly labels: Labels = {},
    ) {}
}

/**
 * Characteristics that would be nonsensical to report as metrics
 */
const METRICS_FILTER = ['Identifier']

export function aggregate(devices: Immutable<Device[]>, timestamp: ImmutableDate): Metric[] {
    const metrics: Metric[][] = []

    for (const device of devices) {
        for (const accessory of device.accessories.accessories) {
            for (const service of accessory.services) {
                const labels = {
                    ...getDeviceLabels(device),
                    ...getAccessoryLabels(accessory),
                    ...getServiceLabels(service),
                }
                metrics.push(extractMetrics(service, timestamp, labels))
            }
        }
    }

    return metrics.flat()
}

function extractMetrics(service: Service, timestamp: ImmutableDate, labels: Labels): Metric[] {
    const metrics: Metric[] = []

    for (const characteristic of service.characteristics) {
        if (METRICS_FILTER.includes(characteristic.description)) {
            continue
        }

        if (characteristic.value == null) {
            continue
        }

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
                {
                    const name = formatName(
                        isKeyOfConstObject(service.type, Uuids) ? Uuids[service.type] : 'custom',
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

    return metrics
}

export function formatName(serviceName: string, description: string, unit: string | null = null): string {
    return (
        [serviceName, description, typeof unit === 'string' ? unit.toLowerCase() : undefined]
            .filter(isType('string'))
            .map((val) => strCamelCaseToSnakeCase(val))
            // Remove duplicate prefix
            .reduce((carry, val) => (val.startsWith(carry) ? val : `${carry}_${val}`))
    )
}

function getDeviceLabels(device: Device): Labels {
    return {
        bridge: device.instance.name,
        device_id: device.instance.deviceID,
    }
}

function getAccessoryLabels(accessory: Accessory): Labels {
    for (const service of accessory.services) {
        if (service.type === Services.AccessoryInformation) {
            return getServiceLabels(service)
        }
    }

    return {}
}

function getServiceLabels(service: Service): Labels {
    const labels: Mutable<Labels> = {}

    for (const characteristic of service.characteristics) {
        if (
            characteristic.value != null &&
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
            labels[strCamelCaseToSnakeCase(characteristic.description)] = characteristic.value
        }
    }

    return labels
}
