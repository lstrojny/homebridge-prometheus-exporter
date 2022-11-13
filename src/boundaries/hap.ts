import z, { type ZodNull, type ZodOptional, type ZodType, type ZodUnion } from 'zod'

const NumericTypesBoundary = z.union([
    z.literal('bool'),
    z.literal('float'),
    z.literal('int'),
    z.literal('uint8'),
    z.literal('uint16'),
    z.literal('uint32'),
    z.literal('uint64'),
])
export type NumericTypes = z.infer<typeof NumericTypesBoundary>

function optionalNullable<T extends ZodType>(type: T): ZodOptional<ZodUnion<[ZodNull, T]>> {
    return z.optional(z.union([z.null(), type]))
}

export const CharacteristicBoundary = z.intersection(
    z.object({ type: z.string(), description: z.string() }),
    z.union([
        z.object({
            format: NumericTypesBoundary,
            unit: z.optional(z.string()),
            value: optionalNullable(z.number()),
        }),
        z.object({ format: z.literal('string'), value: optionalNullable(z.string()) }),
        z.object({ format: z.literal('data'), value: optionalNullable(z.string()) }),
        z.object({ format: z.literal('tlv8'), value: optionalNullable(z.string()) }),
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
