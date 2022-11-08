import z from 'zod'
import { ConfigBoundary as BaseConfigBoundary } from './config'

export * from './hap'
export const ConfigBoundary = z.intersection(BaseConfigBoundary, z.object({ platform: z.string() }))
export type Config = z.infer<typeof ConfigBoundary>
