import type { Config, Device } from '../../boundaries'
import type { HomebridgeLogger } from '../homebridge/types'

export type HapDiscoveryConfig = Readonly<{
    config: Pick<Config, 'debug' | 'pin' | 'refresh_interval' | 'discovery_timeout' | 'request_timeout'>
    log?: HomebridgeLogger
}>

export type HapDiscover = (config: HapDiscoveryConfig) => Promise<ReadonlyArray<Device>>
