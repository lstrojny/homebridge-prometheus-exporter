import type { API, Logger, PlatformConfig } from 'homebridge'
import type { Immutable } from '../../std'

export type HomebridgePlatformConfig = Immutable<PlatformConfig>
export type HomebridgeLogger = Immutable<Logger>
export type HomebridgeApi = Immutable<API>
