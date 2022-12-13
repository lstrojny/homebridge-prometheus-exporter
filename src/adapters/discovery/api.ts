import type { Config, Device } from '../../boundaries'
import type { Logger } from 'homebridge'

export type HapDiscoveryConfig = Readonly<{
    config: Readonly<Pick<Config, 'debug' | 'pin' | 'refresh_interval' | 'discovery_timeout' | 'request_timeout'>>
    log?: Readonly<Logger>
}>

export type HapDiscover = (config: HapDiscoveryConfig) => Promise<ReadonlyArray<Device>>
