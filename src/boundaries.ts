import { Array, Intersect, Literal, Number, Optional, Record, Static, String, Union } from 'runtypes'

export const NUMBER_TYPES = ['float', 'int', 'uint8', 'uint16', 'uint32', 'uint64'] as const
const NumberTypesLiterals = NUMBER_TYPES.map(Literal)
const NumberTypesBoundary = Union(NumberTypesLiterals[0], ...NumberTypesLiterals)
export type NumberTypes = Static<typeof NumberTypesBoundary>

export const CharacteristicBoundary = Intersect(
    Record({ type: String, description: String }),
    Union(
        Record({
            format: NumberTypesBoundary,
            value: Optional(Number),
            unit: Optional(String),
        }),
        Record({ format: Literal('string'), value: String }),
        Record({ format: Literal('bool') }),
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
