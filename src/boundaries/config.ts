import { z } from 'zod'
import { ConfigBoundary as ConfigBoundaryWithoutPlatform } from '../generated/config_boundary'

export const ConfigBoundary = z.intersection(ConfigBoundaryWithoutPlatform, z.object({ platform: z.string() }))
export type Config = z.infer<typeof ConfigBoundary>
