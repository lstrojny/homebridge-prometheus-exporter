import type { API, Logger, PlatformConfig } from 'homebridge'
import type { DeepReadonly } from '../../std'

export type HomebridgePlatformConfig = DeepReadonly<PlatformConfig>
export type HomebridgeLogger = Readonly<Logger>
export type HomebridgeApi = DeepReadonly<API>
