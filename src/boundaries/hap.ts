import z from 'zod'

const NumberAlikeTypesTypesBoundary = z.union([
    z.literal('bool'),
    z.literal('float'),
    z.literal('int'),
    z.literal('uint8'),
    z.literal('uint16'),
    z.literal('uint32'),
    z.literal('uint64'),
])
export type NumberAlikeTypes = z.infer<typeof NumberAlikeTypesTypesBoundary>

export const CharacteristicBoundary = z.intersection(
    z.object({ type: z.string(), description: z.string() }),
    z.union([
        z.object({
            format: NumberAlikeTypesTypesBoundary,
            value: z.optional(z.number()),
            unit: z.optional(z.string()),
        }),
        z.object({ format: z.literal('string'), value: z.string() }),
    ]),
)
export type Characteristic = z.infer<typeof CharacteristicBoundary>

export const ServiceBoundary = z.object({
    type: z.string(),
    characteristics: z.array(CharacteristicBoundary),
})
export type Service = z.infer<typeof ServiceBoundary>

export const AccessoryBoundary = z.object({
    services: z.array(ServiceBoundary),
})
export type Accessory = z.infer<typeof AccessoryBoundary>

export const InstanceBoundary = z.object({
    deviceID: z.string(),
    name: z.string(),
    url: z.string(),
})
export type Instance = z.infer<typeof InstanceBoundary>

export const DeviceBoundary = z.object({
    instance: InstanceBoundary,
    accessories: z.object({
        accessories: z.array(AccessoryBoundary),
    }),
})
export type Device = z.infer<typeof DeviceBoundary>
