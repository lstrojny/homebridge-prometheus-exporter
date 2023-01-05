import { z } from 'zod'
import { ConfigBoundary as ConfigBoundaryWithoutPlatform } from '../generated/config_boundary'
import type { Immutable } from '../std'

export const ConfigBoundary = z.intersection(ConfigBoundaryWithoutPlatform, z.object({ platform: z.string() }))
export type Config = Immutable<z.infer<typeof ConfigBoundary>>
