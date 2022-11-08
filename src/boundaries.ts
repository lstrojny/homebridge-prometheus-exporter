import { Array, Intersect, Literal, Number, Optional, Record, Static, String, Union } from 'runtypes'

export const NUMBER_TYPES = [] as const

const NumberAlikeTypesTypesBoundary = Union(
    Literal('bool'),
    Literal('float'),
    Literal('int'),
    Literal('uint8'),
    Literal('uint16'),
    Literal('uint32'),
    Literal('uint64'),
)
export type NumberAlikeTypes = Static<typeof NumberAlikeTypesTypesBoundary>

export const CharacteristicBoundary = Intersect(
    Record({ type: String, description: String }),
    Union(
        Record({
            format: NumberAlikeTypesTypesBoundary,
            value: Optional(Number),
            unit: Optional(String),
        }),
        Record({ format: Literal('string'), value: String }),
    ),
)
export type Characteristic = Static<typeof CharacteristicBoundary>

export const ServiceBoundary = Record({
    type: String,
    characteristics: Array(CharacteristicBoundary),
})
export type Service = Static<typeof ServiceBoundary>

export const AccessoryBoundary = Record({
    services: Array(ServiceBoundary),
})
export type Accessory = Static<typeof AccessoryBoundary>

export const InstanceBoundary = Record({
    deviceID: String,
    name: String,
    url: String,
})
export type Instance = Static<typeof InstanceBoundary>

export const DeviceBoundary = Record({
    instance: InstanceBoundary,
    accessories: Record({
        accessories: Array(AccessoryBoundary),
    }),
})
export type Device = Static<typeof DeviceBoundary>
