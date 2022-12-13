import { z } from 'zod'
import { ConfigBoundary as ConfigBoundaryWithoutPlatform } from '../generated/config_boundary'
import type { DeepReadonly } from '../std'

export const ConfigBoundary = z.intersection(ConfigBoundaryWithoutPlatform, z.object({ platform: z.string() }))
export type Config = DeepReadonly<z.infer<typeof ConfigBoundary>>
